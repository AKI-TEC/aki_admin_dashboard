# -*- coding: utf-8 -*-
{
    'name': 'AKI Admin Dashboard',
    'version': '18.0.1.0.2',
    'summary': 'Centralized Admin Dashboard with Main, Sales, Purchase, Approval, Invoice, Expenses and Inventory tabs',
    'description': """
        A standalone admin dashboard application accessible from the Odoo home page.
        Provides a tabbed interface covering:
          - Main       : Key KPIs and overall business summary
          - Sales      : Sales pipeline and order metrics
          - Purchase   : Purchase orders and vendor statistics
          - Approval   : Pending approvals and request tracking
          - Invoice    : Invoice status and payment overview
          - Expenses   : Employee expense summaries
          - Inventory  : Stock levels and warehouse overview
    """,
    'category': 'Extra Tools',
    'author': 'AKI',
    'depends': [
        'web',
        'base',
    ],
    'data': [
        'security/security.xml',
        'views/admin_dashboard_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'aki_admin_dashboard/static/src/admin_dashboard/admin_dashboard.js',
            'aki_admin_dashboard/static/src/admin_dashboard/admin_dashboard.xml',
            'aki_admin_dashboard/static/src/admin_dashboard/admin_dashboard.scss',
        ],
    },
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
