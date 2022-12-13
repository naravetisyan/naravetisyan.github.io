import React, { useState } from 'react';
import { Button, Form, AutoComplete, Popover } from 'antd';
import AddNewField from './AddNewField';
import DEFAULT_FIELDS from '../constants/defaultFields';

const FieldsForm = ({ ocrState, highlightTexts, processing, searchPluginInstance }) => {
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [openAddNewInput, setOpenAddNewInput] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [options, setOptions] = useState({});
  const [popupState, setPopupState] = useState(false);

  const words = ocrState?.data?.words || [];

  const { jumpToNextMatch } = searchPluginInstance;

  const onFinish = (values) => {
    console.log('Success:', values);
  };

  const saveNewField = (newField) => {
    setOpenAddNewInput(false);
    setFields((prev) => [...prev, newField]);
  };

  const cancelNewInputAdd = () => {
    setOpenAddNewInput(false);
  };

  const onSearch = (searchText, field) => {
    const filteredWords = words.filter((word) =>
      word.text.toLowerCase().startsWith(searchText.toLowerCase())
    );
    highlightTexts(filteredWords, searchText, field);
    setOptions((prev) => ({
      ...prev,
      [field]: filteredWords.map(({ text }) => ({ value: text, key: text + Math.random() }))
    }));
  };

  const onSelect = (selectedWord, field) => {
    const filteredWords = words.filter((word) =>
      word.text.toLowerCase().includes(selectedWord.toLowerCase())
    );
    highlightTexts(filteredWords, selectedWord, field);
  };

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
        onFinish={onFinish}
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
