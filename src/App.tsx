/**
 * LuminaSQL — AI Database Assistant
 */

import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { DatabaseModal } from './components/DatabaseModal';
import { SchemaBrowser } from './components/SchemaBrowser';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ChatInterface } from './components/ChatInterface';
import { HistoryDrawer } from './components/HistorySidebar';
import { SAMPLE_DATABASES } from './services/sampleData';
import { SQLEngine } from './services/sqlEngine';
import { AISettings, ChatMessage, DatabaseSchema, SampleDatabase, QueryResult } from './types';
import {
  auth,
  signInWithGoogle,
  signInAsGuest,
  saveConversationToFirestore,
  subscribeToUserConversations,
  deleteConversationFromFirestore,
  SavedConversation,
  syncUserProfile
} from './lib/firebase';

function generateUniqueId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export default function App() {
  const [currentSchema, setCurrentSchema] = useState<DatabaseSchema | null>(null);
  const [activeSampleDb, setActiveSampleDb] = useState<SampleDatabase | undefined>(
    SAMPLE_DATABASES[0]
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Firebase Auth & Cloud Conversations state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>(generateUniqueId('session'));
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);

  // Settings state
  const [settings, setSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('lsql_ai_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse settings', e);
      }
    }
    return {
      model: 'gemini-2.5-flash',
      responseStyle: 'beginner',
      autoCorrection: true,
      showSQL: true,
      showExplanation: true,
      defaultChart: 'auto'
    };
  });

  // Modals state
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [isSchemaBrowserOpen, setIsSchemaBrowserOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  
  // Confirmation state for destructive queries
  const [pendingDestructiveMsg, setPendingDestructiveMsg] = useState<{
    msgId: string;
    sql: string;
    operation: string;
    explanation: string;
  } | null>(null);

  // 1. Initialize Firebase Auth state & guest sign-in fallback
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        syncUserProfile(currentUser);
      } else {
        try {
          const guestUser = await signInAsGuest();
          setUser(guestUser);
        } catch (e) {
          console.error('Guest auth initialization failed:', e);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time subscription to user's saved Firestore conversations
  useEffect(() => {
    if (!user) return;

    const unsubscribeConvs = subscribeToUserConversations(user.uid, (convList) => {
      setConversations(convList);
      
      // Auto-load most recent session if current messages array is empty
      if (messagesRef.current.length === 0 && convList.length > 0) {
        const latest = convList[0];
        setActiveConvId(latest.id);
        setMessages(latest.messages || []);

        const matchedSample = SAMPLE_DATABASES.find(
          (d) => d.id === latest.activeSampleDbId || d.name === latest.dbName
        ) || SAMPLE_DATABASES[0];

        setActiveSampleDb(matchedSample);
        const schema = SQLEngine.loadSQLDump(matchedSample.name, matchedSample.sqlDump);
        setCurrentSchema(schema);
      }
    });

    return () => unsubscribeConvs();
  }, [user]);

  // 3. Initialize default sample database on first mount if schema is empty
  useEffect(() => {
    if (!currentSchema) {
      const defaultSample = SAMPLE_DATABASES[0];
      setActiveSampleDb(defaultSample);
      const schema = SQLEngine.loadSQLDump(defaultSample.name, defaultSample.sqlDump);
      setCurrentSchema(schema);
    }
  }, []);

  // Auto-save messages to Firestore whenever messages state updates
  useEffect(() => {
    if (!user || messages.length === 0) return;

    const sessionTitle = messages[0]?.content
      ? messages[0].content.slice(0, 45) + (messages[0].content.length > 45 ? '...' : '')
      : 'SQL Query Session';

    saveConversationToFirestore(user.uid, activeConvId, {
      title: sessionTitle,
      dbName: currentSchema?.name || 'Database',
      activeSampleDbId: activeSampleDb?.id,
      messages
    });
  }, [messages, user, activeConvId]);

  const loadSampleDatabase = (sample: SampleDatabase) => {
    setActiveSampleDb(sample);
    const schema = SQLEngine.loadSQLDump(sample.name, sample.sqlDump);
    setCurrentSchema(schema);
    setMessages([]);
    setActiveConvId(generateUniqueId('session'));
  };

  const handleSelectSavedConversation = (conv: SavedConversation) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages || []);

    const matchedSample = SAMPLE_DATABASES.find(
      (d) => d.id === conv.activeSampleDbId || d.name === conv.dbName
    ) || SAMPLE_DATABASES[0];

    setActiveSampleDb(matchedSample);
    const schema = SQLEngine.loadSQLDump(matchedSample.name, matchedSample.sqlDump);
    setCurrentSchema(schema);
  };

  const handleNewConversation = () => {
    setActiveConvId(generateUniqueId('session'));
    setMessages([]);
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!user) return;
    await deleteConversationFromFirestore(user.uid, convId);
    if (convId === activeConvId) {
      handleNewConversation();
    }
  };

  const handleUploadSqlFile = (filename: string, content: string) => {
    setActiveSampleDb(undefined);
    const schema = SQLEngine.loadSQLDump(filename, content);
    setCurrentSchema(schema);
    setMessages([]);
    setActiveConvId(generateUniqueId('session'));
  };

  const handleUploadCsvFile = (filename: string, content: string) => {
    setActiveSampleDb(undefined);
    const schema = SQLEngine.loadCSV(filename, content);
    setCurrentSchema(schema);
    setMessages([]);
    setActiveConvId(generateUniqueId('session'));
  };

  const handleSendMessage = async (userQuery: string) => {
    if (!currentSchema) return;

    const userMsgId = generateUniqueId('msg-user');
    const assistantMsgId = generateUniqueId('msg-ast');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add user message
    const updatedMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: userQuery,
        timestamp
      }
    ];

    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // 2. Call server AI to generate SQL from user question & schema
      const response = await fetch('/api/ai/generate-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery,
          schema: currentSchema,
          conversationHistory: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          settings
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const generatedAI = await response.json();
      const isDestructive = SQLEngine.isDestructiveOperation(generatedAI.sql);

      // Check if query requires confirmation before execution
      if (generatedAI.requires_confirmation || isDestructive) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: `I generated the requested ${generatedAI.operation} query. Because it mutates or deletes data, please confirm before execution.`,
            timestamp,
            sql: generatedAI.sql,
            explanation: generatedAI.explanation,
            operation: generatedAI.operation,
            requiresConfirmation: true,
            isConfirmed: false,
            logicSteps: generatedAI.logic_steps
          }
        ]);

        setPendingDestructiveMsg({
          msgId: assistantMsgId,
          sql: generatedAI.sql,
          operation: generatedAI.operation,
          explanation: generatedAI.explanation
        });

        setIsLoading(false);
        return;
      }

      // 3. Execute SQL directly against database
      let queryResult: QueryResult = SQLEngine.executeQuery(generatedAI.sql);
      let correctedCount = 0;

      // 4. Auto-correction loop if query failed
      if (queryResult.error && settings.autoCorrection) {
        console.warn('Initial SQL execution failed. Triggering Gemini Auto-Correction...', queryResult.error);
        
        const corrResponse = await fetch('/api/ai/correct-sql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            failedSql: generatedAI.sql,
            errorMessage: queryResult.error,
            userQuery,
            schema: currentSchema,
            settings
          })
        });

        if (corrResponse.ok) {
          const correctedAI = await corrResponse.json();
          queryResult = SQLEngine.executeQuery(correctedAI.sql);
          generatedAI.sql = correctedAI.sql;
          generatedAI.explanation = correctedAI.explanation;
          correctedCount = 1;
        }
      }

      // 5. Ask Gemini to interpret the actual database execution results
      let answerInterpretation = undefined;
      if (!queryResult.error && queryResult.rows) {
        try {
          const explainRes = await fetch('/api/ai/explain-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userQuery,
              sql: generatedAI.sql,
              queryResult: {
                columns: queryResult.columns,
                rows: queryResult.rows,
                executionTimeMs: queryResult.executionTimeMs
              },
              schema: currentSchema,
              settings
            })
          });

          if (explainRes.ok) {
            answerInterpretation = await explainRes.json();
          }
        } catch (e) {
          console.error('Error fetching interpretation:', e);
        }
      }

      // 6. Append completed assistant response
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: answerInterpretation?.answer || generatedAI.explanation,
          timestamp,
          sql: generatedAI.sql,
          explanation: generatedAI.explanation,
          operation: generatedAI.operation,
          requiresConfirmation: false,
          isConfirmed: true,
          queryResult,
          correctedCount,
          logicSteps: generatedAI.logic_steps,
          suggestedVisualization: generatedAI.suggested_visualization,
          answerInterpretation
        }
      ]);

      // Refresh schema if database state changed
      if (['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP'].includes(generatedAI.operation)) {
        setCurrentSchema(SQLEngine.extractSchema(currentSchema.name, activeSampleDb?.sqlDump));
      }

    } catch (err: any) {
      console.error('Error during message processing:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: 'Sorry, an error occurred while processing your database request.',
          timestamp,
          error: err?.message || String(err)
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDestructiveAction = async (msgId: string) => {
    const targetMsg = messages.find((m) => m.id === msgId);
    if (!targetMsg || !targetMsg.sql || !currentSchema) return;

    setPendingDestructiveMsg(null);
    setIsLoading(true);

    const queryResult = SQLEngine.executeQuery(targetMsg.sql);

    // Refresh schema after mutation if execution succeeded
    if (!queryResult.error) {
      setCurrentSchema(SQLEngine.extractSchema(currentSchema.name, activeSampleDb?.sqlDump));
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              isConfirmed: true,
              queryResult,
              content: queryResult.error
                ? `Failed to execute ${m.operation} query: ${queryResult.error}`
                : `Successfully executed ${m.operation} query.`
            }
          : m
      )
    );

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 font-sans text-slate-100 overflow-hidden">
      
      {/* Navigation Bar */}
      <Navbar
        currentSchema={currentSchema}
        user={user}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenSchemaBrowser={() => setIsSchemaBrowserOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onNewChat={handleNewConversation}
      />

      {/* Main Chat Interface */}
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        currentSchema={currentSchema}
        activeSampleDb={activeSampleDb}
        settings={settings}
        onClearChat={() => {
          setMessages([]);
          setActiveConvId(generateUniqueId('session'));
        }}
        onNewChat={handleNewConversation}
        onConfirmDestructiveAction={handleConfirmDestructiveAction}
      />

      {/* History & Cloud Saved Sessions Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        user={user}
        conversations={conversations}
        activeConvId={activeConvId}
        onSelectConversation={handleSelectSavedConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onSignInGoogle={() => signInWithGoogle()}
      />

      {/* Database Workspace Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onSelectSampleDb={loadSampleDatabase}
        onUploadSqlFile={handleUploadSqlFile}
        onUploadCsvFile={handleUploadCsvFile}
        activeSampleDbId={activeSampleDb?.id}
      />

      {/* Schema Browser Modal */}
      <SchemaBrowser
        isOpen={isSchemaBrowserOpen}
        onClose={() => setIsSchemaBrowserOpen(false)}
        schema={currentSchema}
      />

      {/* Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Destructive Query Confirmation Modal */}
      {pendingDestructiveMsg && (
        <ConfirmationModal
          isOpen={!!pendingDestructiveMsg}
          sql={pendingDestructiveMsg.sql}
          operation={pendingDestructiveMsg.operation}
          explanation={pendingDestructiveMsg.explanation}
          onConfirm={() => handleConfirmDestructiveAction(pendingDestructiveMsg.msgId)}
          onCancel={() => setPendingDestructiveMsg(null)}
        />
      )}

    </div>
  );
}
