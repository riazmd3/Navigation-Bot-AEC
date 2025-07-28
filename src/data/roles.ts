import { Role } from '../types';

export const roles: Role[] = [
  {
    id: 'student',
    name: {
      tamil: 'மாணவர்',
      english: 'Student'
    },
    icon: 'GraduationCap'
  },
  {
    id: 'staff',
    name: {
      tamil: 'ஊழியர்',
      english: 'Staff'
    },
    icon: 'Users'
  },
  {
    id: 'parent',
    name: {
      tamil: 'பெற்றோர்',
      english: 'Parent'
    },
    icon: 'Heart'
  }
];