import React, { useState, useEffect } from 'react';
import { Button, Form, AutoComplete, Popover } from 'antd';
import AddNewField from './AddNewField';
import DEFAULT_FIELDS from '../constants/defaultFields';

const FieldsForm = ({ ocrState, highlightTexts, processing, searchPluginInstance, pdfWordSuggestions }) => {
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [openAddNewInput, setOpenAddNewInput] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [options, setOptions] = useState({});
  const [popupState, setPopupState] = useState(false);

  const words = ocrState || [];

  const { jumpToNextMatch } = searchPluginInstance;

  const saveNewField = (newField) => {
    setOpenAddNewInput(false);
    setFields((prev) => [...prev, newField]);
  };

  const cancelNewInputAdd = () => {
    setOpenAddNewInput(false);
  };

  const findWords=(input, matchWholeWord) => {
    return words?.filter((wordObj) => {
      const word = wordObj.text.toLowerCase();
      return matchWholeWord ? word.includes(input.toLowerCase()) : word.startsWith(input.toLowerCase());
    });
  };

  const onSearch = (searchText, field) => {
    const filteredWords = findWords(searchText, false);
    if (filteredWords) {
      highlightTexts(filteredWords, searchText, field);
      setOptions((prev) => ({
        ...prev,
        [field]: filteredWords.map(({ text }) => ({ value: text, key: text + Math.random() }))
      }));
    }
  };


  const onSelect = (selectedWord, field) => {
    const filteredWords = findWords(selectedWord, true);
    highlightTexts(filteredWords, selectedWord, field);
  };

  const adjustPdfWordSuggestions = () => {
    const words = Object.keys(pdfWordSuggestions).reduce((acc, field) => ({
       ...acc,
        [field]: pdfWordSuggestions[field].map(( text ) => ({ value: text, key: text + Math.random() }))
    }), {});
    setOptions(words);
  };

  useEffect(() => {
    adjustPdfWordSuggestions();
  }, [pdfWordSuggestions])
  

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="mb-2">
        {openAddNewInput ? (
          <AddNewField saveNewField={saveNewField} cancelNewInputAdd={cancelNewInputAdd} />
        ) : (
          <Button onClick={() => setOpenAddNewInput(true)} type="primary">
            Add new item
          </Button>
        )}
      </div>
      <Form
        name="basic"
        wrapperCol={{ span: 16 }}
        layout="vertical"
        autoComplete="off"
      >
        {fields.map((field, index) => {
          return (
            <Form.Item key={index} label={field} labelCol name={field}>
              <AutoComplete
                disabled={processing}
                options={options[field]}
                value={formValues[field]}
                onSearch={(text) => onSearch(text, field)}
                onSelect={(text) => onSelect(text, field)}
                onChange={(value) => {
                  setFormValues((prev) => ({ ...prev, [field]: value }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && formValues[field]) {
                    jumpToNextMatch();
                  }
                }}
              />
            </Form.Item>
          );
        })}
        <Form.Item className="mt-2">
          <Popover
            content={JSON.stringify(formValues)}
            title="JSON"
            trigger="click"
            open={popupState}
            onOpenChange={(newOpen) => setPopupState(newOpen)}
          >
            <Button type="primary" disabled={processing}>
              Submit
            </Button>
          </Popover>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FieldsForm;
