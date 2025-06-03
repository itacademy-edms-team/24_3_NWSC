import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge, Pagination, InputGroup, FormControl } from 'react-bootstrap';
import { getUsers, blockUser, updateUserRoles, deleteUser } from '../../services/adminService';
import { User, UserList, BlockUserDto, UpdateUserRolesDto } from '../../types/admin';

const UserManagement: React.FC = () => {
  const [userList, setUserList] = useState<UserList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const availableRoles = ['User', 'Admin'];

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const data = await getUsers(page, 10, search);
      setUserList(data);
      setError(null);
    } catch (error: any) {
      console.error('Ошибка загрузки пользователей:', error);
      setError('Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  const handleBlockUser = async (user: User) => {
    setSelectedUser(user);
    setBlockReason('');
    setShowBlockModal(true);
  };

  const handleEditRoles = async (user: User) => {
    setSelectedUser(user);
    setSelectedRoles([...user.roles]);
    setShowRoleModal(true);
  };

  const handleDeleteUser = async (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmBlock = async () => {
    if (!selectedUser) return;

    try {
      const blockData: BlockUserDto = {
        userId: selectedUser.id,
        isBlocked: !selectedUser.isBlocked,
        reason: blockReason
      };
      
      await blockUser(blockData);
      setShowBlockModal(false);
      await fetchUsers(currentPage, searchTerm);
    } catch (error: any) {
      setError('Не удалось изменить статус пользователя');
    }
  };

  const confirmRoleUpdate = async () => {
    if (!selectedUser) return;

    try {
      const roleData: UpdateUserRolesDto = {
        userId: selectedUser.id,
        roles: selectedRoles
      };
      
      await updateUserRoles(roleData);
      setShowRoleModal(false);
      await fetchUsers(currentPage, searchTerm);
    } catch (error: any) {
      setError('Не удалось обновить роли пользователя');
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      await fetchUsers(currentPage, searchTerm);
    } catch (error: any) {
      setError('Не удалось удалить пользователя');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading && !userList) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Управление пользователями</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Поиск */}
      <Form onSubmit={handleSearch} className="mb-4">
        <InputGroup>
          <FormControl
            placeholder="Поиск по email, имени или фамилии..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline-secondary" type="submit">
            <i className="bi bi-search"></i> Найти
          </Button>
        </InputGroup>
      </Form>
      
      {/* Таблица пользователей */}
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Email</th>
            <th>Имя</th>
            <th>Дата регистрации</th>
            <th>Роли</th>
            <th>Статьи</th>
            <th>Комментарии</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {userList?.users.map(user => (
            <tr key={user.id}>
              <td>
                {user.email}
                {!user.emailConfirmed && (
                  <Badge bg="warning" className="ms-1">Не подтвержден</Badge>
                )}
              </td>
              <td>{`${user.firstName} ${user.lastName}`.trim() || 'Не указано'}</td>
              <td>{formatDate(user.registerDate)}</td>
              <td>
                {user.roles.map(role => (
                  <Badge key={role} bg={role === 'Admin' ? 'danger' : 'primary'} className="me-1">
                    {role}
                  </Badge>
                ))}
              </td>
              <td>{user.articlesCount}</td>
              <td>{user.commentsCount}</td>
              <td>
                <Badge bg={user.isBlocked ? 'danger' : 'success'}>
                  {user.isBlocked ? 'Заблокирован' : 'Активен'}
                </Badge>
              </td>
              <td>
                <div className="btn-group" role="group">
                  <Button
                    variant={user.isBlocked ? 'success' : 'warning'}
                    size="sm"
                    onClick={() => handleBlockUser(user)}
                  >
                    {user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                  </Button>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleEditRoles(user)}
                  >
                    Роли
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteUser(user)}
                  >
                    Удалить
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {/* Пагинация */}
      {userList && userList.pageCount > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.First 
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          />
          
          {Array.from({ length: userList.pageCount }, (_, i) => i + 1)
            .filter(page => 
              page === 1 || 
              page === userList.pageCount || 
              Math.abs(page - currentPage) <= 2
            )
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <Pagination.Ellipsis disabled />
                )}
                <Pagination.Item
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              </React.Fragment>
            ))}
          
          <Pagination.Next 
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === userList.pageCount}
          />
          <Pagination.Last 
            onClick={() => setCurrentPage(userList.pageCount)}
            disabled={currentPage === userList.pageCount}
          />
        </Pagination>
      )}
      
      {/* Модальное окно блокировки */}
      <Modal show={showBlockModal} onHide={() => setShowBlockModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser?.isBlocked ? 'Разблокировать пользователя' : 'Заблокировать пользователя'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Вы уверены, что хотите {selectedUser?.isBlocked ? 'разблокировать' : 'заблокировать'} пользователя{' '}
            <strong>{selectedUser?.email}</strong>?
          </p>
          {!selectedUser?.isBlocked && (
            <Form.Group>
              <Form.Label>Причина блокировки:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Укажите причину блокировки..."
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBlockModal(false)}>
            Отмена
          </Button>
          <Button 
            variant={selectedUser?.isBlocked ? 'success' : 'warning'} 
            onClick={confirmBlock}
          >
            {selectedUser?.isBlocked ? 'Разблокировать' : 'Заблокировать'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Модальное окно редактирования ролей */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать роли пользователя</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Пользователь: <strong>{selectedUser?.email}</strong></p>
          <Form>
            {availableRoles.map(role => (
              <Form.Check
                key={role}
                type="checkbox"
                id={`role-${role}`}
                label={role}
                checked={selectedRoles.includes(role)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRoles([...selectedRoles, role]);
                  } else {
                    setSelectedRoles(selectedRoles.filter(r => r !== role));
                  }
                }}
              />
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={confirmRoleUpdate}>
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Модальное окно удаления */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Удалить пользователя</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Вы уверены, что хотите удалить пользователя <strong>{selectedUser?.email}</strong>?
          </p>
          <Alert variant="warning">
            <strong>Внимание!</strong> Это действие нельзя отменить. Будут удалены все статьи, комментарии и лайки пользователя.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement; 