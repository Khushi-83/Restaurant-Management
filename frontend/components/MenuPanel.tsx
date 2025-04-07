import { Table, Button, Form, Input, InputNumber, Select, Popconfirm, Tag, Space } from 'antd';
import { useState } from 'react';
import styles from './MenuPanel.module.css';

const { Option } = Select;

interface MenuItem {
  key: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
}

export default function MenuPanel() {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [data, setData] = useState<MenuItem[]>([
    {
      key: '1',
      name: 'Paneer Tikka',
      category: 'Starters',
      price: 250,
      description: 'Grilled cottage cheese with spices',
      available: true,
    },
  ]);

  const isEditing = (record: MenuItem) => record.key === editingKey;

  const edit = (record: Partial<MenuItem> & { key: React.Key }) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as MenuItem;
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        newData[index] = { ...newData[index], ...row };
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleDelete = (key: string) => {
    setData(data.filter((item) => item.key !== key));
  };

  const handleAdd = () => {
    const newItem: MenuItem = {
      key: Date.now().toString(),
      name: 'New Item',
      category: 'Starters',
      price: 0,
      description: '',
      available: true,
    };
    setData([...data, newItem]);
    edit(newItem);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      editable: true,
      render: (category: string) => (
        <Tag color={category === 'Main Course' ? 'blue' : 'green'}>{category}</Tag>
      ),
    },
    {
      title: 'Price (₹)',
      dataIndex: 'price',
      key: 'price',
      editable: true,
    },
    {
      title: 'Status',
      dataIndex: 'available',
      key: 'available',
      render: (available: boolean) => (
        <Tag color={available ? 'green' : 'red'}>{available ? 'Available' : 'Unavailable'}</Tag>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_unused: unknown, record: MenuItem) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button type="link" onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              Save
            </Button>
            <Button type="link" onClick={() => setEditingKey('')}>
              Cancel
            </Button>
          </span>
        ) : (
          <Space size="middle">
            <Button type="link" disabled={editingKey !== ''} onClick={() => edit(record)}>
              Edit
            </Button>
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
              <Button type="link">Delete</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h2>Menu Management</h2>
        <Button onClick={handleAdd} type="primary" className={styles.addBtn}>
          Add New Item
        </Button>
      </div>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={columns}
          rowClassName="editable-row"
          pagination={false}
        />
      </Form>
    </div>
  );
}

interface EditableCellProps {
  editing: boolean;
  dataIndex: keyof MenuItem;
  title: string;
  inputType: 'number' | 'text';
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps & React.HTMLAttributes<HTMLElement>> = ({
  editing,
  dataIndex,
  title,
  inputType,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Please Input ${title}!` }]}
        >
          {dataIndex === 'category' ? (
            <Select>
              <Option value="Starters">Starters</Option>
              <Option value="Main Course">Main Course</Option>
              <Option value="Beverages">Beverages</Option>
              <Option value="Desserts">Desserts</Option>
            </Select>
          ) : (
            inputNode
          )}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
