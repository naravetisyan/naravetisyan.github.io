import { useState, forwardRef } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import FileUpload from './FileUpload';
import { toast } from 'react-toastify';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';

const ACCEPTABLE_FILE_TYPES = ['image/jpeg', 'application/pdf'];

const CanvasOrPdf = forwardRef(
  ({ drawCanvasFromImages, processing, searchPluginInstance, setOcrState }, ref) => {
    const [imgs, setImgs] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);

    const handleFileChange = (e) => {
      const files = [...(e.target.files || e.dataTransfer.files)];
      if (!files.length) {
        return;
      }
      if (files.find((file) => !ACCEPTABLE_FILE_TYPES.includes(file.type))) {
        toast.warn('Please upload only .pdf or .jpeg files');
      }

      // pdf part
      if (files.length === 1 && files[0].type === 'application/pdf') {
        setPdfUrl(URL.createObjectURL(files[0]));
        setImgs(null);
        setOcrState(null);
      } else if (files.every((file) => file.type === 'image/jpeg')) {
        // image part
        console.log(files, 'files');
        const imgs = [...files];
        setImgs(imgs);
        setPdfUrl(null);
        drawImageAndGetData(imgs);
      }
    };

    const drawImageAndGetData = async (imgs) => {
      if (imgs) {
        const urls = imgs.map((file) => URL.createObjectURL(file));
        await drawCanvasFromImages(urls);
      }
    };

    return (
      <div className="h-full flex flex-col items-center justify-center">
        <FileUpload handleFileChange={handleFileChange} />
        {pdfUrl ? (
          <div className="mt-4 w-[90%] h-[750px] ">
            <div className="h-full border border-solid border-gray-300">
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.1.81/build/pdf.worker.min.js">
                <Viewer plugins={[searchPluginInstance]} fileUrl={pdfUrl} />
              </Worker>
            </div>
          </div>
        ) : (
          <>
            <h2>{processing && 'Processing...'}</h2>
            <canvas id="canvas" className={imgs ? 'w-4/5 mt-2' : 'w-0'} ref={ref} />
          </>
        )}
      </div>
    );
  }
);

export default CanvasOrPdf;
