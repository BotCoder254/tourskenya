export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};

export const PERMISSIONS = {
  VIEW_TOURS: 'view_tours',
  BOOK_TOURS: 'book_tours',
  MANAGE_TOURS: 'manage_tours',
  MANAGE_BOOKINGS: 'manage_bookings',
  MANAGE_USERS: 'manage_users',
  ACCESS_ADMIN: 'access_admin'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_TOURS,
    PERMISSIONS.BOOK_TOURS,
    PERMISSIONS.MANAGE_TOURS,
    PERMISSIONS.MANAGE_BOOKINGS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ACCESS_ADMIN
  ],
  [ROLES.USER]: [
    PERMISSIONS.VIEW_TOURS,
    PERMISSIONS.BOOK_TOURS
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.VIEW_TOURS
  ]
}; 