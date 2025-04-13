import { Table, Button, Form, Input, InputNumber, Select, Popconfirm, Tag, Space, message } from 'antd';
import { useState, useEffect } from 'react';
import styles from './MenuPanel.module.css';
import Image from 'next/image';

const { Option } = Select;

interface MenuItem {
  id: string;
  key: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
  image_url?: string;
}

export default function MenuPanel() {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [data, setData] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/food-items');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const items = await response.json();
      setData(items.map((item: MenuItem) => ({ ...item, key: item.id })));
    } catch {
      message.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = (record: MenuItem) => record.key === editingKey;

  const edit = (record: Partial<MenuItem> & { key: React.Key }) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
    setImageUrl(record.image_url);
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as MenuItem;
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const updatedItem = { ...newData[index], ...row, image_url: imageUrl };
        newData[index] = updatedItem;
        setData(newData);
        setEditingKey('');

        // Update in backend
        const response = await fetch(`/api/food-items/${key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem),
        });

        if (!response.ok) throw new Error('Failed to update item');
        message.success('Item updated successfully');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
      message.error('Failed to update item');
    }
  };

  const handleDelete = async (key: string) => {
    try {
      const response = await fetch(`/api/food-items/${key}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');
      
      setData(data.filter((item) => item.key !== key));
      message.success('Item deleted successfully');
    } catch {
      message.error('Failed to delete item');
    }
  };

  const handleAdd = () => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
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
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (url: string) => url ? (
        <Image src={url} alt="Menu item" style={{ width: 50, height: 50, objectFit: 'cover' }} />
      ) : null,
    },
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
      editable: true,
      render: (available: boolean) => (
        <Tag color={available ? 'green' : 'red'}>{available ? 'Available' : 'Unavailable'}</Tag>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_: unknown, record: MenuItem) => {
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
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Form>
    </div>
  );
}

interface EditableCellProps {
  editing: boolean;
  dataIndex: keyof MenuItem;
  title: string;
  inputType: 'number' | 'text' | 'boolean';
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
  const inputNode = inputType === 'number' ? <InputNumber /> : 
                    inputType === 'boolean' ? (
                      <Select>
                        <Option value={true}>Available</Option>
                        <Option value={false}>Unavailable</Option>
                      </Select>
                    ) : <Input />;

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
