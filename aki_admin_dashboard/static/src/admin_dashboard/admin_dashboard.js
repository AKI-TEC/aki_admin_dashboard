/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

const TABS = [
    { id: "main",     label: "Main" },
    { id: "sales",    label: "Sales" },
    { id: "purchase", label: "Purchase" },
    { id: "approval", label: "Approval" },
    { id: "invoice",  label: "Invoice" },
    { id: "expenses", label: "Expenses" },
    { id: "inventory",label: "Inventory" },
];

function formatDate(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addDays(date, days) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
}

function getPeriodRange(period, baseDate = new Date()) {
    const endDate = new Date(baseDate);

    if (period === "today") {
        const today = formatDate(endDate);
        return { dateFrom: today, dateTo: today };
    }

    if (period === "week") {
        return {
            dateFrom: formatDate(addDays(endDate, -6)),
            dateTo: formatDate(endDate),
        };
    }

    if (period === "quarter") {
        const quarterStartMonth = Math.floor(endDate.getMonth() / 3) * 3;
        return {
            dateFrom: formatDate(new Date(endDate.getFullYear(), quarterStartMonth, 1)),
            dateTo: formatDate(endDate),
        };
    }

    return {
        dateFrom: formatDate(new Date(endDate.getFullYear(), endDate.getMonth(), 1)),
        dateTo: formatDate(endDate),
    };
}

function getInclusiveDays(dateFrom, dateTo) {
    const startDate = new Date(`${dateFrom}T00:00:00`);
    const endDate = new Date(`${dateTo}T00:00:00`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return 30;
    }
    const days = Math.round((endDate - startDate) / 86400000) + 1;
    return Math.max(1, days);
}

const KPI_CARDS = [
    { label: "Sales Orders", value: "142", delta: "+18.4%", icon: "fa-line-chart", tone: "blue" },
    { label: "Purchase Orders", value: "86", delta: "+7.2%", icon: "fa-shopping-cart", tone: "green" },
    { label: "Approvals Pending", value: "27", delta: "-5.1%", icon: "fa-check-square-o", tone: "amber" },
    { label: "Expenses", value: "48.6K", delta: "+11.8%", icon: "fa-credit-card", tone: "violet" },
    { label: "Invoices", value: "119", delta: "+9.6%", icon: "fa-file-text-o", tone: "rose" },
];

const SALES_TREND = [
    { label: "Mon", value: 42 },
    { label: "Tue", value: 58 },
    { label: "Wed", value: 74 },
    { label: "Thu", value: 63 },
    { label: "Fri", value: 91 },
    { label: "Sat", value: 52 },
    { label: "Sun", value: 68 },
];

const ACTIVITY_MIX = [
    { label: "Sales", value: 38, color: "#2563eb" },
    { label: "Purchase", value: 24, color: "#16a34a" },
    { label: "Approvals", value: 17, color: "#f59e0b" },
    { label: "Expenses", value: 21, color: "#8b5cf6" },
];

const APPROVALS = [
    { label: "Purchase", value: 12, color: "#16a34a" },
    { label: "Expenses", value: 7, color: "#8b5cf6" },
    { label: "Sales Discount", value: 5, color: "#2563eb" },
    { label: "Inventory", value: 3, color: "#0f766e" },
];

const EXPENSES = [
    { label: "Travel", value: 18400, display: "18.4K", color: "#ef4444" },
    { label: "Office", value: 12600, display: "12.6K", color: "#f97316" },
    { label: "Meals", value: 9800, display: "9.8K", color: "#06b6d4" },
    { label: "Other", value: 7800, display: "7.8K", color: "#64748b" },
];

const PIPELINE = [
    { label: "Quotation", value: 64, color: "#38bdf8" },
    { label: "Order", value: 42, color: "#2563eb" },
    { label: "Delivered", value: 31, color: "#16a34a" },
    { label: "Invoiced", value: 24, color: "#8b5cf6" },
];

const PURCHASE_OVERVIEW = [
    { vendor: "Raw Materials", rfq: 28, confirmed: 19, amount: "82.3K" },
    { vendor: "Packaging", rfq: 18, confirmed: 13, amount: "37.8K" },
    { vendor: "Services", rfq: 14, confirmed: 9, amount: "24.1K" },
    { vendor: "Maintenance", rfq: 9, confirmed: 6, amount: "13.7K" },
];

const RADIAL_METRICS = [
    { label: "SO Conversion", value: 72, display: "72%", color: "#22d3ee" },
    { label: "PO Fulfillment", value: 64, display: "64%", color: "#34d399" },
    { label: "Approval SLA", value: 81, display: "81%", color: "#facc15" },
];

const INVOICE_STATUS = [
    { label: "Paid", value: 58, amount: "186.4K", color: "#22c55e" },
    { label: "Open", value: 29, amount: "93.1K", color: "#38bdf8" },
    { label: "Overdue", value: 13, amount: "41.8K", color: "#fb7185" },
];

const CASHFLOW_SERIES = [
    { label: "Jan", income: 72, expense: 38 },
    { label: "Feb", income: 88, expense: 51 },
    { label: "Mar", income: 64, expense: 43 },
    { label: "Apr", income: 96, expense: 56 },
    { label: "May", income: 114, expense: 62 },
    { label: "Jun", income: 102, expense: 58 },
];

const ACTIVITY_HEATMAP = [
    { day: "Mon", value: 92 },
    { day: "Tue", value: 61 },
    { day: "Wed", value: 78 },
    { day: "Thu", value: 44 },
    { day: "Fri", value: 100 },
    { day: "Sat", value: 36 },
    { day: "Sun", value: 24 },
    { day: "Mon", value: 69 },
    { day: "Tue", value: 83 },
    { day: "Wed", value: 57 },
    { day: "Thu", value: 48 },
    { day: "Fri", value: 90 },
    { day: "Sat", value: 31 },
    { day: "Sun", value: 18 },
];

const APPROVAL_TIMELINE = [
    { label: "Submitted", value: 44, color: "#38bdf8" },
    { label: "Manager", value: 31, color: "#a78bfa" },
    { label: "Finance", value: 18, color: "#facc15" },
    { label: "Approved", value: 26, color: "#34d399" },
];

const RISK_INDICATORS = [
    { label: "Late Deliveries", value: "9", note: "3 vendors", tone: "rose" },
    { label: "Budget Alerts", value: "14", note: "this month", tone: "amber" },
    { label: "Low Stock", value: "22", note: "items", tone: "blue" },
];

const SYSTEM_SIGNALS = [
    { label: "Live Sync", value: "Active", icon: "fa-wifi", tone: "green" },
    { label: "Data Pulse", value: "2.4s", icon: "fa-bolt", tone: "blue" },
    { label: "Forecast", value: "Stable", icon: "fa-magic", tone: "violet" },
    { label: "Alerts", value: "6", icon: "fa-bell-o", tone: "amber" },
];

const SALES_TAB_KPIS = [
    { label: "Revenue", value: "428K", delta: "+21%", icon: "fa-money", tone: "blue" },
    { label: "Orders", value: "312", delta: "+38", icon: "fa-shopping-bag", tone: "green" },
    { label: "Quotations", value: "164", delta: "+14%", icon: "fa-file-text-o", tone: "violet" },
    { label: "Win Rate", value: "68%", delta: "+6%", icon: "fa-bullseye", tone: "amber" },
];

const SALES_REVENUE = [
    { label: "Jan", value: 62 },
    { label: "Feb", value: 78 },
    { label: "Mar", value: 71 },
    { label: "Apr", value: 96 },
    { label: "May", value: 121 },
    { label: "Jun", value: 108 },
];

const SALES_CHANNELS = [
    { label: "Direct", value: 42, color: "#38bdf8" },
    { label: "Website", value: 28, color: "#34d399" },
    { label: "CRM", value: 19, color: "#a78bfa" },
    { label: "Partner", value: 11, color: "#facc15" },
];

const SALES_TOP_CUSTOMERS = [
    { name: "Al Noor Trading", orders: 42, revenue: "96.4K", margin: "31%" },
    { name: "Prime Steel", orders: 35, revenue: "81.2K", margin: "27%" },
    { name: "Gulf Retail", orders: 29, revenue: "67.8K", margin: "24%" },
    { name: "Metro Projects", orders: 22, revenue: "54.1K", margin: "22%" },
];

const PURCHASE_TAB_KPIS = [
    { label: "RFQs", value: "118", delta: "+16", icon: "fa-list-alt", tone: "blue" },
    { label: "Purchase Orders", value: "86", delta: "+7%", icon: "fa-shopping-cart", tone: "green" },
    { label: "Avg Lead Time", value: "5.8d", delta: "-1.2d", icon: "fa-clock-o", tone: "amber" },
    { label: "Spend", value: "236K", delta: "+9%", icon: "fa-credit-card", tone: "violet" },
];

const PURCHASE_SPEND = [
    { label: "Materials", value: 92, color: "#38bdf8" },
    { label: "Services", value: 48, color: "#a78bfa" },
    { label: "Packaging", value: 37, color: "#34d399" },
    { label: "Fleet", value: 21, color: "#facc15" },
];

const PURCHASE_VENDORS = [
    { name: "Atlas Supplies", po: 22, onTime: "96%", value: "72.1K" },
    { name: "Nova Packaging", po: 18, onTime: "91%", value: "44.8K" },
    { name: "Blue Line Services", po: 14, onTime: "88%", value: "31.3K" },
    { name: "Urban Maintenance", po: 9, onTime: "84%", value: "18.6K" },
];

const APPROVAL_TAB_KPIS = [
    { label: "Pending", value: "27", delta: "open", icon: "fa-hourglass-half", tone: "amber" },
    { label: "Approved", value: "142", delta: "+18", icon: "fa-check", tone: "green" },
    { label: "Rejected", value: "8", delta: "-3", icon: "fa-times", tone: "rose" },
    { label: "Avg SLA", value: "14h", delta: "-2h", icon: "fa-bolt", tone: "blue" },
];

const APPROVAL_QUEUE = [
    { type: "Purchase", owner: "Operations", pending: 12, aging: "1.4d" },
    { type: "Expenses", owner: "Finance", pending: 7, aging: "0.8d" },
    { type: "Discount", owner: "Sales", pending: 5, aging: "0.5d" },
    { type: "Stock", owner: "Warehouse", pending: 3, aging: "1.1d" },
];

const INVOICE_TAB_KPIS = [
    { label: "Total Invoices", value: "119", delta: "+22", icon: "fa-file-text-o", tone: "blue" },
    { label: "Paid", value: "69", delta: "58%", icon: "fa-check-circle", tone: "green" },
    { label: "Open", value: "35", delta: "29%", icon: "fa-folder-open-o", tone: "amber" },
    { label: "Overdue", value: "15", delta: "13%", icon: "fa-exclamation-circle", tone: "rose" },
];

const INVOICE_AGING = [
    { label: "0-30", value: 44, color: "#34d399" },
    { label: "31-60", value: 28, color: "#38bdf8" },
    { label: "61-90", value: 17, color: "#facc15" },
    { label: "90+", value: 11, color: "#fb7185" },
];

const INVOICE_CUSTOMERS = [
    { name: "Al Noor Trading", due: "32.4K", overdue: "4.2K", status: "Review" },
    { name: "Prime Steel", due: "28.7K", overdue: "0.0K", status: "Good" },
    { name: "Gulf Retail", due: "21.1K", overdue: "2.8K", status: "Follow-up" },
    { name: "Metro Projects", due: "16.9K", overdue: "1.1K", status: "Good" },
];

const EXPENSE_TAB_KPIS = [
    { label: "Submitted", value: "48.6K", delta: "+12%", icon: "fa-credit-card", tone: "violet" },
    { label: "Approved", value: "36.2K", delta: "74%", icon: "fa-check", tone: "green" },
    { label: "Pending", value: "9.1K", delta: "19%", icon: "fa-hourglass", tone: "amber" },
    { label: "Policy Alerts", value: "6", delta: "needs review", icon: "fa-flag", tone: "rose" },
];

const EXPENSE_EMPLOYEES = [
    { name: "A. Khan", category: "Travel", amount: "8.4K", state: "Submitted" },
    { name: "M. Hassan", category: "Meals", amount: "5.9K", state: "Approved" },
    { name: "S. Ali", category: "Office", amount: "4.7K", state: "Review" },
    { name: "N. Omar", category: "Fuel", amount: "3.2K", state: "Submitted" },
];

const INVENTORY_TAB_KPIS = [
    { label: "Stock Value", value: "812K", delta: "+4%", icon: "fa-cubes", tone: "blue" },
    { label: "On Hand", value: "14.8K", delta: "units", icon: "fa-archive", tone: "green" },
    { label: "Low Stock", value: "22", delta: "items", icon: "fa-level-down", tone: "amber" },
    { label: "Transfers", value: "64", delta: "today", icon: "fa-exchange", tone: "violet" },
];

const INVENTORY_MOVES = [
    { label: "Receipts", value: 72, color: "#34d399" },
    { label: "Deliveries", value: 86, color: "#38bdf8" },
    { label: "Internal", value: 39, color: "#a78bfa" },
    { label: "Returns", value: 13, color: "#fb7185" },
];

const INVENTORY_PRODUCTS = [
    { name: "Steel Bracket", onHand: 42, min: 80, status: "Low" },
    { name: "Packing Box M", onHand: 310, min: 250, status: "Good" },
    { name: "Hydraulic Seal", onHand: 18, min: 40, status: "Reorder" },
    { name: "Cable Tie", onHand: 1260, min: 600, status: "Good" },
];

function scaleNumber(value, factor) {
    return Math.max(1, Math.round(value * factor));
}

function scaleDisplay(value, factor) {
    if (typeof value !== "string") {
        return value;
    }
    const amountMatch = value.match(/^(\d+(?:\.\d+)?)K$/);
    if (amountMatch) {
        const amount = Number(amountMatch[1]) * factor;
        return `${amount >= 100 ? Math.round(amount) : amount.toFixed(1)}K`;
    }
    if (/^\d+$/.test(value)) {
        return String(scaleNumber(Number(value), factor));
    }
    return value;
}

function scaleCards(cards, factor) {
    return cards.map((card) => ({
        ...card,
        value: /%|d|h|units|Active|Stable/.test(card.value) ? card.value : scaleDisplay(card.value, factor),
    }));
}

function scaleValues(items, factor, fields = ["value"]) {
    return items.map((item) => {
        const scaledItem = { ...item };
        for (const field of fields) {
            if (typeof scaledItem[field] === "number") {
                scaledItem[field] = scaleNumber(scaledItem[field], factor);
            } else {
                scaledItem[field] = scaleDisplay(scaledItem[field], factor);
            }
        }
        return scaledItem;
    });
}

export class AkiAdminDashboard extends Component {
    static template = "aki_admin_dashboard.AdminDashboard";

    setup() {
        this.companyService = useService("company");
        this.activeCompanyIds = this.companyService.activeCompanyIds || [];
        this.companyFactor = this._getCompanyFactor();
        this.companyScopeLabel = this._getCompanyScopeLabel();
        this.tabs = TABS;
        this.radialMetrics = RADIAL_METRICS;
        this.systemSignals = SYSTEM_SIGNALS;
        this.salesChannels = SALES_CHANNELS;
        this.invoiceAging = INVOICE_AGING;
        this.selectTab = this.selectTab.bind(this);
        this.setPeriod = this.setPeriod.bind(this);
        this.applyDateFilter = this.applyDateFilter.bind(this);
        this.updateDateFrom = this.updateDateFrom.bind(this);
        this.updateDateTo = this.updateDateTo.bind(this);
        const defaultRange = getPeriodRange("month");
        this.state = useState({
            activeTab: "main",
            period: "month",
            dateFrom: defaultRange.dateFrom,
            dateTo: defaultRange.dateTo,
            appliedPeriod: "month",
            appliedDateFrom: defaultRange.dateFrom,
            appliedDateTo: defaultRange.dateTo,
            filterDirty: false,
            filterRevision: 0,
        });
        this._refreshDashboardData();
    }

    _getDateFactor() {
        const periodFactor = {
            today: 0.35,
            week: 0.68,
            month: 1,
            quarter: 1.75,
            custom: 1,
        };
        if (this.state.appliedPeriod !== "custom") {
            return periodFactor[this.state.appliedPeriod] || 1;
        }
        const days = getInclusiveDays(this.state.appliedDateFrom, this.state.appliedDateTo);
        return Math.min(2.4, Math.max(0.22, days / 30));
    }

    _refreshDashboardData() {
        const factor = this.companyFactor * this._getDateFactor();
        this.kpiCards = scaleCards(KPI_CARDS, factor);
        this.salesTrend = scaleValues(SALES_TREND, factor);
        this.activityMix = ACTIVITY_MIX;
        this.approvals = scaleValues(APPROVALS, factor);
        this.expenses = scaleValues(EXPENSES, factor, ["value", "display"]);
        this.pipeline = scaleValues(PIPELINE, factor);
        this.purchaseOverview = scaleValues(PURCHASE_OVERVIEW, factor, ["rfq", "confirmed", "amount"]);
        this.invoiceStatus = scaleValues(INVOICE_STATUS, factor, ["amount"]);
        this.cashflowSeries = scaleValues(CASHFLOW_SERIES, factor, ["income", "expense"]);
        this.activityHeatmap = scaleValues(ACTIVITY_HEATMAP, factor);
        this.approvalTimeline = scaleValues(APPROVAL_TIMELINE, factor);
        this.riskIndicators = scaleValues(RISK_INDICATORS, factor, ["value"]);
        this.salesTabKpis = scaleCards(SALES_TAB_KPIS, factor);
        this.salesRevenue = scaleValues(SALES_REVENUE, factor);
        this.salesTopCustomers = scaleValues(SALES_TOP_CUSTOMERS, factor, ["orders", "revenue"]);
        this.purchaseTabKpis = scaleCards(PURCHASE_TAB_KPIS, factor);
        this.purchaseSpend = scaleValues(PURCHASE_SPEND, factor);
        this.purchaseVendors = scaleValues(PURCHASE_VENDORS, factor, ["po", "value"]);
        this.approvalTabKpis = scaleCards(APPROVAL_TAB_KPIS, factor);
        this.approvalQueue = scaleValues(APPROVAL_QUEUE, factor, ["pending"]);
        this.invoiceTabKpis = scaleCards(INVOICE_TAB_KPIS, factor);
        this.invoiceCustomers = scaleValues(INVOICE_CUSTOMERS, factor, ["due", "overdue"]);
        this.expenseTabKpis = scaleCards(EXPENSE_TAB_KPIS, factor);
        this.expenseEmployees = scaleValues(EXPENSE_EMPLOYEES, factor, ["amount"]);
        this.inventoryTabKpis = scaleCards(INVENTORY_TAB_KPIS, factor);
        this.inventoryMoves = scaleValues(INVENTORY_MOVES, factor);
        this.inventoryProducts = scaleValues(INVENTORY_PRODUCTS, factor, ["onHand", "min"]);
    }

    _getCompanyFactor() {
        const companyIds = this.activeCompanyIds.length ? this.activeCompanyIds : [this.companyService.currentCompany?.id || 1];
        const seed = companyIds.reduce((total, companyId) => total + (companyId % 7) + 3, 0);
        return Math.max(0.45, seed / 7);
    }

    _getCompanyScopeLabel() {
        const activeIds = this.activeCompanyIds.length ? this.activeCompanyIds : [this.companyService.currentCompany?.id].filter(Boolean);
        const companies = activeIds
            .map((companyId) => this.companyService.getCompany?.(companyId) || this.companyService.allowedCompanies?.[companyId])
            .filter(Boolean);
        if (!companies.length) {
            return "Selected companies";
        }
        if (companies.length === 1) {
            return companies[0].name;
        }
        return `${companies[0].name} + ${companies.length - 1} companies`;
    }

    selectTab(tabId) {
        this.state.activeTab = tabId;
    }

    isActive(tabId) {
        return this.state.activeTab === tabId;
    }

    setPeriod(period) {
        const range = getPeriodRange(period);
        this.state.period = period;
        this.state.dateFrom = range.dateFrom;
        this.state.dateTo = range.dateTo;
        this.applyDateFilter();
    }

    applyDateFilter() {
        this.state.appliedPeriod = this.state.period;
        this.state.appliedDateFrom = this.state.dateFrom;
        this.state.appliedDateTo = this.state.dateTo;
        this.state.filterDirty = false;
        this.state.filterRevision += 1;
        this._refreshDashboardData();
    }

    updateDateFrom(ev) {
        this.state.period = "custom";
        this.state.dateFrom = ev.target.value;
        this.state.filterDirty = true;
    }

    updateDateTo(ev) {
        this.state.period = "custom";
        this.state.dateTo = ev.target.value;
        this.state.filterDirty = true;
    }

    get maxSalesValue() {
        return Math.max(...this.salesTrend.map((item) => item.value));
    }

    get totalActivity() {
        return this.activityMix.reduce((total, item) => total + item.value, 0);
    }

    get maxApprovalValue() {
        return Math.max(...this.approvals.map((item) => item.value));
    }

    get maxExpenseValue() {
        return Math.max(...this.expenses.map((item) => item.value));
    }

    get maxPipelineValue() {
        return Math.max(...this.pipeline.map((item) => item.value));
    }

    get maxCashflowValue() {
        return Math.max(...this.cashflowSeries.flatMap((item) => [item.income, item.expense]));
    }

    get maxTimelineValue() {
        return Math.max(...this.approvalTimeline.map((item) => item.value));
    }

    get invoiceTotal() {
        return this.invoiceStatus.reduce((total, item) => total + item.value, 0);
    }

    barHeight(value, maxValue) {
        const percent = Math.round((value / maxValue) * 100);
        return `height: ${Math.max(percent, 10)}%;`;
    }

    barWidth(value, maxValue) {
        const percent = Math.round((value / maxValue) * 100);
        return `width: ${Math.max(percent, 8)}%;`;
    }

    colorStyle(color) {
        return `background: ${color}; border-color: ${color}; box-shadow: 0 0 18px ${color};`;
    }

    ringStyle(item) {
        return `background: conic-gradient(${item.color} ${item.value}%, rgba(148, 163, 184, 0.14) 0); box-shadow: 0 0 24px ${item.color};`;
    }

    heatStyle(value) {
        const opacity = Math.max(value / 100, 0.18).toFixed(2);
        return `--aki-heat-color: rgba(34, 211, 238, ${opacity});`;
    }

    statusWidth(value) {
        const percent = Math.round((value / this.invoiceTotal) * 100);
        return `width: ${percent}%;`;
    }

    get activityDonutStyle() {
        let cursor = 0;
        const segments = this.activityMix.map((item) => {
            const start = cursor;
            cursor += (item.value / this.totalActivity) * 100;
            return `${item.color} ${start}% ${cursor}%`;
        });
        return `background: conic-gradient(${segments.join(", ")});`;
    }

    maxValue(items, field = "value") {
        return Math.max(...items.map((item) => item[field]));
    }

    donutStyle(items) {
        const total = items.reduce((sum, item) => sum + item.value, 0);
        let cursor = 0;
        const segments = items.map((item) => {
            const start = cursor;
            cursor += (item.value / total) * 100;
            return `${item.color} ${start}% ${cursor}%`;
        });
        return `background: conic-gradient(${segments.join(", ")});`;
    }
}

registry.category("actions").add("aki_admin_dashboard", AkiAdminDashboard);
