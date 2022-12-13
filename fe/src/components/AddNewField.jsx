import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';

const AddNewField = ({ saveNewField, cancelNewInputAdd }) => {
  const [newInputVal, setNewInputVal] = useState('');

  const handleCancel = () => {
    cancelNewInputAdd();
  };

  const onFinish = () => {
    saveNewField(newInputVal);
  };

  return (
    <Form onFinish={onFinish} wrapperCol={{ span: 16 }} layout="vertical">
      <Form.Item rules={[{ required: true, message: 'Please write field name' }]} name="new-field">
        <Input
          placeholder="New Item Name"
          value={newInputVal}
          onChange={(e) => {
            setNewInputVal(e.target.value);
          }}
        />
      </Form.Item>
      <Button onClick={handleCancel} type="default">
        Cancel
      </Button>
      <Button className="ml-2" type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
};

export default AddNewField;
