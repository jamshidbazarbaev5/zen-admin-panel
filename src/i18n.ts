import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      navigation: {
        dashobard: 'Dashboard',
        pos: 'POS',
        revaluations: 'Revaluations',
        writeoff: 'Write-offs',
        transfers: 'Transfers',
        smena: 'Shifts',
        stocks: 'Stocks',
        stock_balance: 'Stock Balance',
        sale: 'Sales',
        clients: 'Clients',
        debt: 'Debts',
        expense: 'Expenses',
        income: 'Income',
        recyclings: 'Recyclings',
        vehicle_incomes: 'Vehicle Incomes',
        sponsors: 'Sponsors',
        add_money: 'Add Money',
        settings: 'Settings',
        stores: 'Stores',
        check: 'Receipt',
        categories: 'Categories',
        measurements: 'Measurements',
        currencies: 'Currencies',
        products: 'Products',
        suppliers: 'Suppliers',
        cash_inflow_names: 'Cash Inflow Names',
        expense_name: 'Expense Names',
        users: 'Users',
        labelSizes: 'Label Sizes',
        chargeTypes: 'Charge Types',
        cassas: 'Cash Registers',
      },
      common: {
        profile: 'Profile',
        logout: 'Logout',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
