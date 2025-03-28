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
import { useEffect, useRef } from 'react';

DocumentEditorContainerComponent.Inject(Toolbar);
registerLicense(
  'Ngo9BigBOggjHTQxAR8/V1NMaF1cXmhNYVJ2WmFZfVtgdV9DZVZUTGYuP1ZhSXxWdkZiWH9fdXJVR2BaWEE='
);

export const DocumentEditor = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<DocumentEditorContainerComponent>(null);

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

    editor.contentChange = async () => {
      console.log('Document Content changed');
      const blob = await editor.saveAsBlob('Docx');
      const file = new File([blob], `Document.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      console.log(file);
    };
  }, []);

  return (
    <>
      <div className="px-24 bg-gray-300 pt-12 h-screen">
        <div className="flex justify-end space-x-4 mb-4">
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
        <div>
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
