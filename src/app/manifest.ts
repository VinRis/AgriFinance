import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Agri Finance',
    short_name: 'AgriFinance',
    description: 'Financial management for your livestock enterprise.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    shortcuts: [
      {
        name: 'Log Milk',
        short_name: 'Milk',
        description: 'Log daily dairy production',
        url: '/production/dairy',
      },
      {
        name: 'Log Eggs',
        short_name: 'Eggs',
        description: 'Log daily egg production',
        url: '/production/poultry',
      },
      {
        name: 'New Task',
        short_name: 'Task',
        description: 'Schedule a new farm task',
        url: '/tasks',
      },
      {
        name: 'Add Expense',
        short_name: 'Expense',
        description: 'Record a farm expense',
        url: '/finances/dairy',
      },
      {
        name: 'View Reports',
        short_name: 'Reports',
        description: 'View financial and production reports',
        url: '/reports/dairy',
      }
    ]
  }
}
