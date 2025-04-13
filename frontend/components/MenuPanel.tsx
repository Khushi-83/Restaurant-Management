import { Table, Button, Form, Input, InputNumber, Select, Popconfirm, Tag, Space, message, Upload } from 'antd';
import { useState, useEffect } from 'react';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import styles from './MenuPanel.module.css';

const { Option } = Select;

interface MenuItem {
  key: string;
  id?: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
  image_url?: string;
  quantity_per_serve?: number;
}

interface MenuFormValues {
  name: string;
  category: string;
  price: number;
  description?: string;
  quantity_per_serve?: number;
}

export default function MenuPanel() {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [data, setData] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [uploadLoading, setUploadLoading] = useState(false);

  // Fetch menu items on component mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/food-items');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const items = await response.json();
      setData(items.map((item: MenuItem) => ({
        ...item,
        key: item.id || item.key || Date.now().toString()
      })));
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      message.error('Failed to load menu items');
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setImageUrl(data.url);
      return data.url;
    } catch (err) {
      message.error('Failed to upload image');
      console.error('Upload error:', err);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAddItem = async (values: MenuFormValues) => {
    try {
      setLoading(true);

      if (!imageUrl) {
        message.error('Please upload an image');
        setLoading(false);
        return;
      }

      const menuItem = {
        name: values.name,
        price: values.price,
        description: values.description || '',
        category: values.category,
        image_url: imageUrl,
        quantity_per_serve: values.quantity_per_serve,
        available: true
      };

      const response = await fetch('/api/food-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItem)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add menu item');
      }

      await fetchMenuItems();
      message.success('Menu item added successfully');
      form.resetFields();
      setImageUrl(undefined);
    } catch (err) {
      console.error('Failed to add menu item:', err);
      message.error(err instanceof Error ? err.message : 'Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

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
        const item = newData[index];
        const updatedItem = { ...item, ...row };
        
        const response = await fetch(`/api/food-items/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });

        if (!response.ok) {
          throw new Error('Failed to update menu item');
        }

        newData[index] = updatedItem;
        setData(newData);
        setEditingKey('');
        message.success('Item updated successfully');
      }
    } catch (err) {
      console.error('Update failed:', err);
      message.error('Failed to update item');
    }
  };

  const handleDelete = async (key: string) => {
    try {
      const item = data.find(item => item.key === key);
      if (!item?.id) {
        setData(data.filter((item) => item.key !== key));
        return;
      }

      const response = await fetch(`/api/food-items/${item.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setData(data.filter((item) => item.key !== key));
      message.success('Item deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      message.error('Failed to delete item');
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setImageUrl(undefined);
    form.validateFields()
      .then((values) => {
        handleAddItem(values as MenuFormValues);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image',
      render: (url: string) => url ? (
        <img src={url} alt="Menu item" style={{ width: 50, height: 50, objectFit: 'cover' }} />
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Menu Management</h2>
        <Space>
          <Upload
            name="file"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={async (file) => {
              await handleImageUpload(file);
              return false;
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Menu item" style={{ width: '100%' }} />
            ) : (
              uploadButton
            )}
          </Upload>
          <Button 
            onClick={handleAdd} 
            type="primary" 
            className={styles.addBtn}
            loading={loading}
          >
            Add New Item
          </Button>
        </Space>
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
          columns={columns.map(col => ({
            ...col,
            onCell: (record: MenuItem) => ({
              record,
              editable: col.editable,
              dataIndex: col.dataIndex,
              title: col.title,
              editing: isEditing(record),
            }),
          }))}
          rowClassName="editable-row"
          pagination={{
            onChange: () => setEditingKey(''),
            pageSize: 10
          }}
        />
      </Form>
    </div>
  );
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: keyof MenuItem;
  title: string;
  record: MenuItem;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  children,
  ...restProps
}) => {
  let inputNode;
  
  switch(dataIndex) {
    case 'category':
      inputNode = (
        <Select>
          <Option value="Starters">Starters</Option>
          <Option value="Main Course">Main Course</Option>
          <Option value="Beverages">Beverages</Option>
          <Option value="Desserts">Desserts</Option>
        </Select>
      );
      break;
    case 'price':
      inputNode = <InputNumber min={0} />;
      break;
    case 'available':
      inputNode = (
        <Select>
          <Option value={true}>Available</Option>
          <Option value={false}>Unavailable</Option>
        </Select>
      );
      break;
    default:
      inputNode = <Input />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Please Input ${title}!` }]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
