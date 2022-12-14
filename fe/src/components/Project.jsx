import { Row, Col } from 'antd';
import React, { useState, useRef } from 'react';
import CanvasOrPdf from './CanvasOrPdf';
import FieldsForm from './FieldsForm';
import axios from 'axios';
import useDidMountEffect from '../hooks/useDidMountEffect';
import { ToastContainer } from 'react-toastify';
import dataUrlToFile from '../utils/dataUrlToFile';
import { searchPlugin } from '@react-pdf-viewer/search';

import 'react-toastify/dist/ReactToastify.css';

const Project = () => {
  const [ocrState, setOcrState] = useState();
  const [rectData, setRectData] = useState({});
  const [texts, setTexts] = useState({});
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [pdfWordSuggestions, setPdfWordSuggestions] = useState({})

  const canvasRef = useRef(null);

  const searchPluginInstance = searchPlugin();

  const { highlight, clearHighlights } = searchPluginInstance;

  const highlightTexts = async (words, searchableText, field) => {
    setTexts((prev) => ({
      ...prev,
      [field]: searchableText
    }));
    if (ocrState) {
      if (!words || !searchableText) return;
      let tempRects = JSON.parse(JSON.stringify(rectData));
      words.forEach((word) => {
        const color = Math.floor(Math.random() * 16777215).toString(16);
        tempRects = {
          ...tempRects,
          [field]: {
            [searchableText]: [
              ...(tempRects[field]?.[searchableText] || []),
              [
                word.bbox.x0,
                word.bbox.y0,
                word.symbols[searchableText.length - 1].bbox.x1 - word.bbox.x0,
                word.bbox.y1 - word.bbox.y0
              ]
            ],
            color: tempRects[field]?.color ? tempRects[field].color : `#${color}`
          }
        };
      });
      setRectData(tempRects);
    } else {
      const uniqueVals = new Set();
      const highlightedWords = searchableText ? await highlight(searchableText) : clearHighlights();
      highlightedWords?.forEach((word) => {
        const regex = new RegExp(` (${searchableText}[^\\s]+) `, 'gd')
        const match = word.pageText.match(regex);
        match?.forEach((m) => {
          uniqueVals.add(m.trim());
        });
      });
      setPdfWordSuggestions({
        ...pdfWordSuggestions,
        [field]: Array.from(uniqueVals)
      });
    }
  };

  const drawCanvasFromImages = (imgSources) => {
    try {
      setProcessing(true);
      let nextYCoordinate = 0;
      let maxWidth = 0;
      let maxHeight = 0;
      return Promise.all(
        imgSources.map(function (url) {
          return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () {
              resolve(img);
            };
            img.src = url;
          });
        })
      ).then(async (images) => {
        var canvas = canvasRef.current;
        var ctx = canvas.getContext('2d');

        images.forEach((image) => {
          maxWidth = image.width > maxWidth ? image.width : maxWidth;
          maxHeight = maxHeight + image.height;
        });
        canvas.width = maxWidth;
        canvas.height = maxHeight;

        images.forEach((image) => {
          ctx.drawImage(
            image,
            0,
            0,
            image.width,
            image.height,
            0,
            nextYCoordinate,
            image.width,
            image.height
          );
          nextYCoordinate = nextYCoordinate + image.height;
        });
        const base64 = canvas.toDataURL('image/jpeg');

        const image = new Image();
        image.src = base64;
        const file = dataUrlToFile(base64, 'image.jpeg');
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios
          .post('https://50f5-141-136-90-87.eu.ngrok.io/recognize-image', formData, {
          // .post('http://localhost:3008/recognize-image', formData, {
            'Content-Type': 'multipart/form-data;'
          })
        setOcrState(response.data);
        setImage(image);
        setProcessing(false);
      });
    } catch (e) {
      setProcessing(false);
      console.log(e);
    }
  };

  const redrawCanvas = () => {
    let canvas = canvasRef.current;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    Object.values(rectData).forEach((field) => {
      Object.values(texts).forEach((text) => {
        field[text] &&
          field[text].forEach((rect) => {
            ctx.lineWidth = '2';
            ctx.strokeStyle = field.color;
            ctx.strokeRect(...rect);
          });
      });
    });
  };


  useDidMountEffect(() => {
    if (rectData && image && ocrState) {
      redrawCanvas();
    }
  }, [rectData, image, texts]);

  return (
    <>
      <Row className="h-full">
        <Col span={12} className="text-orange-500">
          <CanvasOrPdf
            setOcrState={setOcrState}
            drawCanvasFromImages={drawCanvasFromImages}
            ref={canvasRef}
            processing={processing}
            searchPluginInstance={searchPluginInstance}
          />
        </Col>
        <Col span={12}>
          <FieldsForm
            ocrState={ocrState}
            highlightTexts={highlightTexts}
            processing={processing}
            searchPluginInstance={searchPluginInstance}
            pdfWordSuggestions={pdfWordSuggestions}
          />
        </Col>
      </Row>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={true}
      />
    </>
  );
};

export default Project;
