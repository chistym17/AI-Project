import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AssistantTabs from '../../components/AssistantTabs';
import QnAList from '../../components/QnAList';
import QnAEditor from '../../components/QnAEditor';
import ToolsList from '../../components/ToolsList';
import ToolEditor from '../../components/ToolEditor';
import { API_ENDPOINTS } from '../../config/api';

const AssistantDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [assistant, setAssistant] = useState(null);
  const [activeTab, setActiveTab] = useState('qa');
  const [showQaForm, setShowQaForm] = useState(false);
  const [editingQa, setEditingQa] = useState(null);
  const [showToolForm, setShowToolForm] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [toolsReloadKey, setToolsReloadKey] = useState(0);

  useEffect(() => {
    if (!router.isReady || !id) return;
    const load = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ASSISTANT(id));
        if (res.ok) {
          const data = await res.json();
          setAssistant(data);
        }
      } catch (e) {
        // noop
      }
    };
    load();
  }, [router.isReady, id]);

  const onTabChange = (key) => setActiveTab(key);

  const onQaSaved = () => {
    setShowQaForm(false);
    setEditingQa(null);
  };

  const onToolSaved = (updatedTool = null) => {
    if (updatedTool) {
      setShowToolForm(false);
      setEditingTool(null);
      setToolsReloadKey(prev => prev + 1);
    } else {
      setShowToolForm(false);
      setEditingTool(null);
      setToolsReloadKey(prev => prev + 1);
    }
  };

  if (!router.isReady || !id || !assistant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-100">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{assistant.name}</h1>
              <p className="text-gray-600 mt-1">{assistant.description}</p>
            </div>
            <button onClick={() => router.push('/assistants')} className="px-4 py-2 border rounded">
              Back to list
            </button>
          </div>
        </div>

        {/* Tabs */}
        <AssistantTabs initial={activeTab} onChange={onTabChange} />

        {/* Content */}
        <div className="rounded-lg shadow p-6">
          {activeTab === 'qa' ? (
            showQaForm ? (
              <QnAEditor
                assistantId={id}
                qa={editingQa}
                onSave={onQaSaved}
                onCancel={() => { setShowQaForm(false); setEditingQa(null); }}
              />
            ) : (
              <QnAList
                assistantId={id}
                onEdit={(qa) => { setEditingQa(qa); setShowQaForm(true); }}
              />
            )
          ) : activeTab === 'tools' ? (
            showToolForm ? (
              <ToolEditor
                assistantId={id}
                tool={editingTool}
                onSaved={onToolSaved}
                onCancel={() => { setShowToolForm(false); setEditingTool(null); }}
              />
            ) : (
              <ToolsList
                key={toolsReloadKey}
                assistantId={id}
                onAdd={() => setShowToolForm(true)}
                onEdit={(tool) => { setEditingTool(tool); setShowToolForm(true); }}
              />
            )
          ) : activeTab === 'flows' ? (
            <div className="max-w-4xl mx-auto py-8">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Visual Flow Editor</h2>
                <p className="text-lg text-gray-600">Design intelligent conversation flows with drag-and-drop simplicity</p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Conversation Flows</h3>
                  <p className="text-gray-700 text-sm">Connect nodes to represent different conversation states and guide user interactions seamlessly</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Organize Tools Visually</h3>
                  <p className="text-gray-700 text-sm">Group related functions into specific nodes like menu tools, payment tools, and support tools</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Control Conversation Flow</h3>
                  <p className="text-gray-700 text-sm">Define how the AI transitions between different conversation contexts and maintains state</p>
                </div>
              </div>

              {/* Action Section */}
              <div className="text-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to build your flow?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Launch the visual editor to start creating sophisticated conversation flows with an intuitive drag-and-drop interface.
                </p>

                {/* Two colorful CTAs side-by-side (stack on mobile) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => router.push(`/assistants/${id}/visual-flows`)}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Open Visual Flow Editor
                  </button>

                  {/* New colorful button for Text Flow Editor */}
                  <button
                    onClick={() => router.push(`/assistants/${id}/text-flows`)}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:via-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    Open Text Flow Editor
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AssistantDetailsPage;
