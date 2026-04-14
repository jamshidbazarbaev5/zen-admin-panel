import {
  Package,
  Menu,
  X,
  LogOut,
  Users,
  ShoppingBag,
  FolderTree,
  Settings,
  ShoppingCart,
  CreditCard,
  Award,
  Radio,
  Building2,
  Monitor,
  Wallet,
  RefreshCw,
  UserCheck,
  ClipboardList,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLogout, useGetCurrentUser } from "../api/auth";
// import { useAuth } from "../context/AuthContext";
import { useCurrentUser } from "../hooks/useCurrentUser";

type NavItem = {
  icon: LucideIcon;
  label: string;
  href?: string;
  id?: string;
  submenu?: NavItem[];
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // const { currentUser } = useAuth();
  const { mutate: logout } = useLogout();
  const { data: userData } = useCurrentUser();
  const { data: currentUserData } = useGetCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

 

  // API hooks

//   const handleCurrencySubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!selectedCurrency || !currencyRate) {
//       toast.error("Please select a currency and enter a rate");
//       return;
//     }

//     setLoading(true);
//     try {
//       await createCurrencyRate.mutateAsync({
//         currency: parseInt(selectedCurrency),
//         rate: currencyRate,
//       });

//       toast.success("Currency rate created successfully");
//       setCurrencyModalOpen(false);
//       setSelectedCurrency("");
//       setCurrencyRate("");
//       // Reload page to update currency rates across the application
//       window.location.reload();
//     } catch (error: unknown) {
//       const errorMessage =
//         (error as any)?.response?.data?.detail ||
//         "Failed to create currency rate";
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

  // Mobile user redirection logic
  useEffect(() => {
    if (userData?.is_mobile_user && userData?.has_active_shift) {
      const currentPath = location.pathname;
      // Allow mobile users to stay on specific pages
      const allowedPaths = [
        "/create-sale",
        "/sales",
        "/debts/:id/payments",
        "/clients",
        "/create-client",
        "/debts",
        "/expense",
        "/create-expense",
        "/pos-fullscreen",
        "/pos",
        "/dashboard",
        "/product-stock-balance",
        "/close-shift/active",
        "/create-expense",
      ];

      // Check for exact matches or dynamic routes
      const isAllowed =
        allowedPaths.some((path) => currentPath.startsWith(path)) ||
        currentPath.startsWith("/edit-client/");

      if (!isAllowed) {
        navigate("/create-sale");
      }
    }
  }, [
    userData?.is_mobile_user,
    userData?.has_active_shift,
    location.pathname,
    navigate,
  ]);

  // Set active submenu based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    navItems.forEach((item: NavItem) => {
      if (
        item.id &&
        item.submenu &&
        item.submenu.some((subItem) => subItem.href === currentPath)
      ) {
        setActiveSubmenu(item.id);
      }
    });
  }, [location.pathname]);

  const navItems: NavItem[] = [
    {
      icon: Package,
      label: t("navigation.dashobard"),
      href: "/dashboard",
    },
    {
      icon: FolderTree,
      label: "Категории",
      href: "/categories",
    },
    {
      icon: ShoppingBag,
      label: "Продукты",
      href: "/products",
    },
    {
      icon: Settings,
      label: "Группы модификаторов",
      href: "/modifier-groups",
    },
    {
      icon: ShoppingCart,
      label: "Заказы",
      href: "/orders",
    },
    {
      icon: CreditCard,
      label: "Платежи",
      href: "/payments",
    },
    {
      icon: Award,
      label: "Уровни кэшбэка",
      href: "/cashback-tiers",
    },
    {
      icon: Users,
      label: "Клиенты",
      href: "/customers",
    },
    {
      icon: Radio,
      label: "Рассылки",
      href: "/broadcasts",
    },
    {
      icon: Building2,
      label: "Организации",
      href: "/organizations",
    },
    {
      icon: Monitor,
      label: "Терминальные группы",
      href: "/terminal-groups",
    },
    {
      icon: Wallet,
      label: "Типы оплаты",
      href: "/payment-types",
    },
    {
      icon: RefreshCw,
      label: "Синхронизация iiko",
      href: "/sync",
    },
    {
      icon: UserCheck,
      label: "Сотрудники",
      href: "/staff",
    },
    {
      icon: ClipboardList,
      label: "Посещаемость",
      href: "/attendance",
    },
    {
      icon: Settings,
      label: "Настройки бизнеса",
      href: "/business-settings",
    },
    // {
    //   icon: Settings,
    //   label: "Настройки",
    //   href: "/settings",
    // },
  ];

  // Check if user is admin
  const isAdmin = userData?.is_superuser || userData?.role === 'admin';

  // Filter navigation items based on role
  const filteredNavItems = isAdmin 
    ? navItems 
    : navItems.filter(item => item.href === '/orders');

  // Redirect non-admin users to orders page
  useEffect(() => {
    if (!isAdmin && location.pathname !== '/orders' && location.pathname !== '/login') {
      navigate('/orders');
    }
  }, [isAdmin, location.pathname, navigate]);

  return (
    <div className="h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Mobile Header */}
      <header className="md:hidden bg-background shadow-sm px-4 py-2 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">{t('common.logout')}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-muted"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-muted-foreground" />
            ) : (
              <Menu size={24} className="text-muted-foreground" />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row relative mt-14 md:mt-0">
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        {/* Sidebar - Desktop and Mobile */}
        <aside
          className={`
          ${mobileMenuOpen ? "block" : "hidden"}
          md:block
          w-full bg-card shadow-lg
          fixed md:sticky
          top-[3.5rem] md:top-0
          h-[calc(100vh-3.5rem)] md:h-screen
          z-50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "md:w-20" : "md:w-72"}
          flex-shrink-0
          flex flex-col
        `}
        >
          {/* Desktop Logo and Language Switcher */}
          <div className="hidden md:block px-6 py-6 border-b border-border bg-muted/50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Menu size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-4 flex flex-col relative z-50 h-[calc(100vh-6rem)] overflow-y-auto bg-card">
            {filteredNavItems.map((item, index) => (
              <div key={index}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => {
                        if (item.id) {
                          setActiveSubmenu(
                            activeSubmenu === item.id ? null : item.id,
                          );
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1 transition-colors
                        ${
                          activeSubmenu === item.id
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-muted"
                        }`}
                    >
                      <item.icon
                        size={20}
                        className={
                          activeSubmenu === item.id
                            ? "text-blue-500"
                            : "text-muted-foreground"
                        }
                      />
                      {!isCollapsed && (
                        <>
                          <span className="font-medium">{item.label}</span>
                          <svg
                            className={`ml-auto h-5 w-5 transform transition-transform ${
                              activeSubmenu === item.id ? "rotate-180" : ""
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                    {activeSubmenu === item.id && (
                      <div
                            className={`ml-2 ${
                          isCollapsed
                            ? "absolute left-full top-0 ml-2 bg-card border border-border shadow-lg rounded-lg p-2 min-w-[200px] max-h-[80vh] overflow-y-auto"
                            : ""
                        }`}
                      >
                        {item.submenu.map((subItem, subIndex) => (
                          <a
                            key={subIndex}
                            href={subItem.href}
                            onClick={(e) => {
                              e.preventDefault();
                              setMobileMenuOpen(false);
                              if (subItem.href) navigate(subItem.href);
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1 transition-colors
                              ${
                                location.pathname === subItem.href
                                  ? "bg-accent text-accent-foreground"
                                  : "text-foreground hover:bg-muted"
                              }`}
                          >
                            <subItem.icon
                              size={20}
                              className={
                                location.pathname === subItem.href
                                  ? "text-blue-500"
                                  : "text-muted-foreground"
                              }
                            />
                            <span className="font-medium">{subItem.label}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      if (item.href === '/dashboard') {
                        window.location.href = '/dashboard';
                      } else if (item.href) {
                        navigate(item.href);
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1 transition-colors
                      ${
                        location.pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                  >
                    <item.icon
                      size={20}
                      className={
                        location.pathname === item.href
                          ? "text-blue-500"
                          : "text-muted-foreground"
                      }
                    />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </a>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 transition-all duration-300 overflow-x-auto ">
          <div className="h-full flex flex-col min-w-[320px]">
            <div className="bg-background px-4 md:px-6 py-4 flex items-center justify-end gap-4 sticky top-0 z-30 border-b border-border">
              {/* User Profile Dropdown */}
              {currentUserData && (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <UserIcon size={20} className="text-primary" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{currentUserData.staff_name || currentUserData.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUserData.is_superuser 
                          ? t('staff.positions.admin')
                          : currentUserData.staff_position 
                            ? t(`staff.positions.${currentUserData.staff_position}`)
                            : t('profile.role')}
                      </p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setProfileDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <h3 className="font-semibold text-lg text-gray-900">{t('profile.title')}</h3>
                        </div>
                        <div className="p-4 space-y-3 bg-white">
                          <div>
                            <p className="text-xs text-gray-500">{t('profile.id')}</p>
                            <p className="text-sm font-medium text-gray-900">{currentUserData.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('profile.username')}</p>
                            <p className="text-sm font-medium text-gray-900">{currentUserData.username}</p>
                          </div>
                          {currentUserData.staff_name && (
                            <div>
                              <p className="text-xs text-gray-500">{t('profile.staffName')}</p>
                              <p className="text-sm font-medium text-gray-900">{currentUserData.staff_name}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500">{t('profile.role')}</p>
                            <p className="text-sm font-medium text-gray-900">
                              {currentUserData.is_superuser 
                                ? t('staff.positions.admin')
                                : currentUserData.role || t('staff.positions.staff')}
                            </p>
                          </div>
                          {currentUserData.staff_position && (
                            <div>
                              <p className="text-xs text-gray-500">{t('profile.position')}</p>
                              <p className="text-sm font-medium text-gray-900">
                                {t(`staff.positions.${currentUserData.staff_position}`)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Desktop Logout Button */}
              <div className="hidden md:block">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="font-medium">{t('common.logout')}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              <div
                className="max-w-[1920px] mx-auto "
                style={{ background: "l" }}
              >
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
