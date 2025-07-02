import { registerLicense } from '@syncfusion/ej2-base';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';
import '@syncfusion/ej2-react-documenteditor/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import { useEffect, useRef, useState } from 'react';

DocumentEditorContainerComponent.Inject(Toolbar);
registerLicense(
  'Ngo9BigBOggjHTQxAR8/V1NMaF1cXmhNYVJ2WmFZfVtgdV9DZVZUTGYuP1ZhSXxWdkZiWH9fdXJVR2BaWEE='
);

export const DocumentEditor = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<DocumentEditorContainerComponent>(null);
  const [clauses, setClauses] = useState<
    Array<{ text: string; bookmarkName: string; index: number }>
  >([]);
  const [newClause, setNewClause] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clauseToRemove, setClauseToRemove] = useState<number | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const savedClauses = localStorage.getItem('documentEditor_clauses');

    if (savedClauses) {
      try {
        const parsedClauses = JSON.parse(savedClauses);

        setClauses(parsedClauses);
      } catch (error) {
        console.error('Error loading saved clauses:', error);
      }
    }
    setIsDataLoaded(true);
  }, []);

  const loadSavedData = async () => {
    try {
      const savedDocument = localStorage.getItem('documentEditor_content');

      if (savedDocument && editorRef.current) {
        const editor = editorRef.current.documentEditor;

        const byteCharacters = atob(savedDocument);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        const file = new File([blob], 'saved_document.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        editor.open(file);
      } else {
        console.log('No saved document or editor not ready');
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const saveData = async () => {
    try {
      if (isDataLoaded) {
        localStorage.setItem('documentEditor_clauses', JSON.stringify(clauses));
      }

      if (editorRef.current) {
        const editor = editorRef.current.documentEditor;
        const blob = await editor.saveAsBlob('Docx');

        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          localStorage.setItem('documentEditor_content', base64Data);
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleOpen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target.files?.[0];
    const editor = editorRef.current!.documentEditor;

    if (!fileInput) return;

    editor.open(fileInput);
  };

  const handleDownload = async () => {
    const editor = editorRef.current!.documentEditor;
    const blob = await editor.saveAsBlob('Docx');

    const file = new File([blob], `Document.docx`, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    downloadFile(file);
  };

  useEffect(() => {
    const editor = editorRef.current!.documentEditor;

    const checkEditorReady = () => {
      if (editor && editor.documentHelper) {
        loadSavedData();
      } else {
        setTimeout(checkEditorReady, 500);
      }
    };

    checkEditorReady();

    editor.contentChange = async () => {
      const blob = await editor.saveAsBlob('Docx');
      const file = new File([blob], `Document.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      saveData();
    };
  }, []);

  useEffect(() => {
    saveData();
  }, [clauses]);

  const handleAddClause = () => {
    if (newClause.trim()) {
      const clauseText = newClause.trim();
      setNewClause('');

      insertClauseIntoDocument(clauseText);
    }
  };

  const insertClauseIntoDocument = (clauseText: string) => {
    const editor = editorRef.current!.documentEditor;
    editor.focusIn();

    const bookmarkName = `clause_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const start = editor.selection.start.clone();

    editor.editor.insertText(clauseText);

    const end = editor.selection.end.clone();

    editor.selection.selectRange(start, end);

    editor.editor.insertBookmark(bookmarkName);

    editor.selection.moveToLineEnd();
    editor.editor.insertText('\n');

    setClauses((prev) => [
      ...prev,
      { text: clauseText, bookmarkName: bookmarkName, index: prev.length },
    ]);
  };

  const handleRemoveClause = (index: number) => {
    setClauseToRemove(index);
    setShowConfirmModal(true);
  };

  const confirmRemoveClause = () => {
    if (clauseToRemove === null) return;

    const editor = editorRef.current?.documentEditor;
    if (!editor) return;

    const clauseToRemoveData = clauses[clauseToRemove];
    const bookmarkName = clauseToRemoveData.bookmarkName;

    editor.selection.selectBookmark(bookmarkName);

    if (!editor.selection.isEmpty) {
      editor.editor.delete();
    }

    setClauses((prev) => prev.filter((_, i) => i !== clauseToRemove));
    setShowConfirmModal(false);
    setClauseToRemove(null);
  };

  const cancelRemoveClause = () => {
    setShowConfirmModal(false);
    setClauseToRemove(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddClause();
    }
  };

  const clearAllData = () => {
    localStorage.removeItem('documentEditor_clauses');
    localStorage.removeItem('documentEditor_content');
    setClauses([]);
    if (editorRef.current) {
      editorRef.current.documentEditor.open('');
    }
  };

  return (
    <>
      <div className="px-24 bg-gray-300 pt-12 h-screen">
        <div className="flex justify-between items-center mb-4">
          <button
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            onClick={clearAllData}
          >
            Clear All Data
          </button>
          <div className="flex space-x-4">
            <button
              className="bg-gray-500 text-white py-2 px-4 rounded"
              onClick={() => fileInputRef.current?.click()}
            >
              Open
            </button>
            <input
              type="file"
              accept=".docx"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleOpen}
            />
            <button
              className="bg-gray-500 text-white py-2 px-4 rounded"
              onClick={handleDownload}
            >
              Download
            </button>
          </div>
        </div>
        <div className="flex gap-6 h-full">
          <div className="flex-1">
            <DocumentEditorContainerComponent
              height="calc(100vh - 200px)"
              serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
              enableToolbar={true}
              showPropertiesPane={false}
              ref={editorRef}
              toolbarItems={[
                'New',
                'Open',
                'Separator',
                'Undo',
                'Redo',
                'Separator',
                'Bookmark',
                'Table',
                'Separator',
                'Find',
              ]}
              contentChange={(e) => {}}
            />
          </div>
          <div className="w-80 bg-gray-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Clauses Editor
            </h3>

            <div className="flex flex-col gap-2 mb-4">
              <input
                type="text"
                value={newClause}
                onChange={(e) => setNewClause(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a new clause..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddClause}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Clause
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {clauses.map((clause, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200"
                >
                  <span className="text-gray-700 flex-1 text-sm">
                    {clause.text}
                  </span>
                  <button
                    onClick={() => handleRemoveClause(index)}
                    className="ml-2 text-red-500 hover:text-red-700 focus:outline-none flex-shrink-0"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              {clauses.length === 0 && (
                <p className="text-gray-500 text-center py-4 text-sm">
                  No clauses added yet. Add your first clause above.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Removal
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove the clause?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelRemoveClause}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveClause}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const downloadFile = (file: File) => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
};
