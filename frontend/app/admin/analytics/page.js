'use client';
import { useEffect, useState, useMemo } from 'react';
import { getAllOrders } from '../../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import styles from './analytics.module.css';

export default function Analytics() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('daily'); // daily, monthly, yearly
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [backendWarning, setBackendWarning] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getAllOrders();
            if (Array.isArray(data)) {
                console.log("Analytics Orders Data:", data);
                setOrders(data);

                // Check if backend is populating sweets
                if (data.length > 0 && data[0].items.length > 0) {
                    const firstItem = data[0].items[0];
                    if (typeof firstItem.sweet === 'string') {
                        setBackendWarning(true);
                        console.error("Backend Warning: item.sweet is a string (ID), not populated. Backend restart required.");
                    }
                }
            } else {
                console.error("Analytics Error: Expected array of orders but got:", data);
                setOrders([]);
            }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setOrders([]);
        }
    };

    const processData = useMemo(() => {
        const dataMap = {};
        const categoryMap = {};
        let totalRevenue = 0;
        let totalProfit = 0;

        if (!Array.isArray(orders) || orders.length === 0) return { chartData: [], categoryData: [], totalRevenue: 0, totalProfit: 0 };

        // 1. Process Order Data
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            let key;
            let timestamp; // Normalized timestamp for sorting and gap filling

            if (filter === 'daily') {
                key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); // Include year for sorting safely, display can be shorter
                timestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
            } else if (filter === 'monthly') {
                key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                timestamp = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
            } else if (filter === 'yearly') {
                key = date.getFullYear().toString();
                timestamp = new Date(date.getFullYear(), 0, 1).getTime();
            }

            let orderCost = 0;
            let orderRevenue = 0;
            let orderItemsCount = 0;

            order.items.forEach(item => {
                const itemCategory = item.sweet?.category || 'Uncategorized';

                if (selectedCategory !== 'All' && itemCategory !== selectedCategory) {
                    return;
                }

                const quantity = item.quantity;
                const cost = (item.costPriceAtPurchase || 0) * quantity;
                const price = (item.priceAtPurchase || 0) * quantity;
                const profit = price - cost;

                orderCost += cost;
                orderRevenue += price;
                orderItemsCount += quantity;

                if (!categoryMap[itemCategory]) {
                    categoryMap[itemCategory] = { name: itemCategory, value: 0 };
                }
                categoryMap[itemCategory].value += profit;
            });

            const orderProfit = orderRevenue - orderCost;
            totalRevenue += orderRevenue;
            totalProfit += orderProfit;

            if (!dataMap[timestamp]) {
                dataMap[timestamp] = {
                    timestamp: timestamp,
                    displayKey: key,
                    sales: 0,
                    profit: 0,
                    orders: 0,
                    quantity: 0
                };
            }
            dataMap[timestamp].sales += orderRevenue;
            dataMap[timestamp].profit += orderProfit;
            if (orderRevenue > 0) dataMap[timestamp].orders += 1;
            dataMap[timestamp].quantity += orderItemsCount;
        });

        // 2. Fill Missing Dates (Timeline Continuity)
        const allOrderDates = orders.map(order => new Date(order.createdAt));
        const minDate = new Date(Math.min(...allOrderDates));
        const maxDate = new Date(Math.max(...allOrderDates));

        const fullTimelineMap = {};
        let currentDate = new Date(minDate);

        // Normalize start and end dates based on filter
        if (filter === 'daily') {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
            maxDate.setHours(23, 59, 59, 999); // Ensure maxDate includes the entire day
        } else if (filter === 'monthly') {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            maxDate.setDate(1); // Set to 1st of month
            maxDate.setMonth(maxDate.getMonth() + 1); // Go to next month
            maxDate.setDate(0); // Go to last day of previous month
            maxDate.setHours(23, 59, 59, 999);
        } else if (filter === 'yearly') {
            currentDate = new Date(currentDate.getFullYear(), 0, 1);
            maxDate.setMonth(11);
            maxDate.setDate(31);
            maxDate.setHours(23, 59, 59, 999);
        }

        while (currentDate <= maxDate) {
            let timestamp;
            let displayKey;

            if (filter === 'daily') {
                timestamp = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
                displayKey = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                currentDate.setDate(currentDate.getDate() + 1);
            } else if (filter === 'monthly') {
                timestamp = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
                displayKey = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                currentDate.setMonth(currentDate.getMonth() + 1);
            } else if (filter === 'yearly') {
                timestamp = new Date(currentDate.getFullYear(), 0, 1).getTime();
                displayKey = currentDate.getFullYear().toString();
                currentDate.setFullYear(currentDate.getFullYear() + 1);
            }

            fullTimelineMap[timestamp] = dataMap[timestamp] || {
                timestamp: timestamp,
                displayKey: displayKey,
                sales: 0,
                profit: 0,
                orders: 0,
                quantity: 0
            };
        }

        const chartData = Object.values(fullTimelineMap)
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(item => ({
                ...item,
                name: item.displayKey
            }));

        const categoryData = Object.values(categoryMap).filter(c => c.value > 0);

        return { chartData, categoryData, totalRevenue, totalProfit };
    }, [orders, filter, selectedCategory]);

    const { chartData, categoryData, totalRevenue, totalProfit } = processData;

    // Colors for pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Analytics Dashboard</h1>
                {backendWarning && (
                    <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '10px', border: '1px solid #fecaca' }}>
                        <strong>⚠️ CRITICAL:</strong> Your backend is outdated. Trends will be empty. Please <strong>RESTART your backend terminal</strong> (Ctrl+C then npm start) to fix this.
                    </div>
                )}
                <div className={styles.controls}>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={styles.select}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginRight: '10px' }}
                    >
                        <option value="All">All Categories</option>
                        <option value="Chocolate">Chocolate</option>
                        <option value="Gummy">Gummy</option>
                        <option value="Hard Candy">Hard Candy</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Classic">Classic</option>
                    </select>
                    <div className={styles.filterGroup}>
                        <button className={filter === 'daily' ? styles.active : ''} onClick={() => setFilter('daily')}>Daily</button>
                        <button className={filter === 'monthly' ? styles.active : ''} onClick={() => setFilter('monthly')}>Monthly</button>
                        <button className={filter === 'yearly' ? styles.active : ''} onClick={() => setFilter('yearly')}>Yearly</button>
                    </div>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Total Sales {selectedCategory !== 'All' && `(${selectedCategory})`}</h3>
                    <p className={styles.money}>₹{totalRevenue.toFixed(2)}</p>
                </div>
                <div className={styles.statCard}>
                    <h3>Total Profit {selectedCategory !== 'All' && `(${selectedCategory})`}</h3>
                    <p className={`${styles.money} ${totalProfit >= 0 ? styles.positive : styles.negative}`}>
                        ₹{totalProfit.toFixed(2)}
                    </p>
                </div>
                <div className={styles.statCard}>
                    <h3>Total Orders {selectedCategory !== 'All' && `(containing ${selectedCategory})`}</h3>
                    {/* Orders count logic is slightly fuzzy when filtering items, but "orders containing X" is close enough */}
                    <p>{chartData.reduce((acc, curr) => acc + curr.orders, 0)}</p>
                </div>
            </div>

            <div className={styles.chartsWrapper}>
                {/* Sales & Profit Bar Chart */}
                <div className={`${styles.chartCard} ${styles.fullWidthChart}`}>
                    <h3>Sales & Profit ({filter})</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} cursor={{ fill: '#f3f4f6' }} formatter={(value) => [`₹${value.toFixed(2)}`, undefined]} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar dataKey="sales" fill="#6366f1" name="Revenue" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Products Sold Quantity */}
                <div className={styles.chartCard}>
                    <h3>Quantity Sold ({filter})</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} cursor={{ fill: '#f3f4f6' }} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar dataKey="quantity" fill="#f59e0b" name="Quantity Sold" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit by Category Pie Chart */}
                {/* Only show Pie Chart if 'All' is selected, otherwise it's trivial (100% selected category) */}
                {selectedCategory === 'All' && (
                    <div className={styles.chartCard}>
                        <h3>Profit by Category</h3>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Profit']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
