import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import "./AdminDashboard.css";

interface ChartData {
  name: string;
  value: number;
}

interface RecentActivity {
  type: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  timestamp: string;
}

interface DashboardData {
  totalUsers: number;
  matchesToday: number;
  fillRate: number;
  pendingReports: number;
  userGrowthChart: ChartData[];
  matchGrowthChart: ChartData[];
  popularSportsChart: ChartData[];
  recentActivities: RecentActivity[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#f43f5e", "#10b981", "#3b82f6"];

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/admin/dashboard", {
          credentials: "include",
        });

        if (response.status === 401 || response.status === 403) {
          setError("Bạn không có quyền truy cập trang quản trị.");
          return;
        }

        if (!response.ok) {
          throw new Error("Lỗi khi tải dữ liệu dashboard");
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="fa-solid fa-triangle-exclamation me-2"></i>
        {error}
      </div>
    );
  }

  // Gộp data của userGrowth và matchGrowth
  const combinedGrowthData: any[] = [];
  if (data?.userGrowthChart || data?.matchGrowthChart) {
    const allMonths = new Set<string>();
    data?.userGrowthChart?.forEach(d => allMonths.add(d.name));
    data?.matchGrowthChart?.forEach(d => allMonths.add(d.name));

    Array.from(allMonths).sort().forEach(month => {
      const uCount = data?.userGrowthChart?.find(d => d.name === month)?.value || 0;
      const mCount = data?.matchGrowthChart?.find(d => d.name === month)?.value || 0;
      combinedGrowthData.push({
        name: month,
        "Người dùng mới": uCount,
        "Trận đấu mới": mCount
      });
    });
  }

  return (
    <div className="admin-dashboard">
      <div className="row g-4 mb-4">
        {/* Total Users */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card shadow-sm border-0 h-100" data-custom-tooltip={`Đăng ký mới hôm nay: ${data?.newUsersToday || 0} | Tuần này: ${data?.newUsersThisWeek || 0}`}>
            <div className="card-body d-flex align-items-center">
              <div className="stat-icon bg-primary-subtle text-primary me-3">
                <i className="fa-solid fa-users"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Tổng Số User</h6>
                <h3 className="mb-0 fw-bold">{data?.totalUsers?.toLocaleString() || 0}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Matches Today */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card shadow-sm border-0 h-100" data-custom-tooltip={`Tạo hôm nay: ${data?.matchesToday || 0} | Đã hoàn thành: ${data?.completedMatchesToday || 0}`}>
            <div className="card-body d-flex align-items-center">
              <div className="stat-icon bg-success-subtle text-success me-3">
                <i className="fa-solid fa-futbol"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Trận Mở Hôm Nay</h6>
                <h3 className="mb-0 fw-bold">{data?.matchesToday?.toLocaleString() || 0}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Fill Rate */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card shadow-sm border-0 h-100" data-custom-tooltip="Tỷ lệ trung bình thành viên tham gia trên mỗi trận đấu">
            <div className="card-body d-flex align-items-center">
              <div className="stat-icon bg-info-subtle text-info me-3">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Tỷ Lệ Lấp Đầy</h6>
                <h3 className="mb-0 fw-bold">{(data?.fillRate || 0) * 100}%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card shadow-sm border-0 h-100" data-custom-tooltip={`Báo cáo mới hôm nay: ${data?.newReportsToday || 0}`}>
            <div className="card-body d-flex align-items-center">
              <div className="stat-icon bg-danger-subtle text-danger me-3">
                <i className="fa-solid fa-flag"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Báo Cáo Chờ Duyệt</h6>
                <h3 className="mb-0 fw-bold">{data?.pendingReports?.toLocaleString() || 0}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="row g-4 mb-4">
        {/* Line Chart */}
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <h6 className="fw-bold mb-0">Xu Hướng Tăng Trưởng</h6>
            </div>
            <div className="card-body" style={{ height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedGrowthData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: "#6c757d" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6c757d" }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                  <Line type="monotone" dataKey="Người dùng mới" stroke="#0088FE" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Trận đấu mới" stroke="#00C49F" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="col-12 col-xl-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <h6 className="fw-bold mb-0">Tỷ Lệ Môn Thể Thao</h6>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center" style={{ height: "350px" }}>
              {(data?.popularSportsChart && data.popularSportsChart.length > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.popularSportsChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.popularSportsChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-4 pb-3">
              <h6 className="fw-bold mb-0">Hoạt Động Gần Đây</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4 border-0 text-muted fw-semibold small">Hoạt động</th>
                      <th className="border-0 text-muted fw-semibold small">Loại</th>
                      <th className="border-0 text-muted fw-semibold small">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentActivities?.length ? (
                      data.recentActivities.map((activity, index) => (
                        <tr key={index}>
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center">
                              <div className="activity-icon-wrapper rounded-circle me-3 d-flex align-items-center justify-content-center" 
                                   style={{ width: '40px', height: '40px', backgroundColor: activity.type === 'NEW_USER' ? '#eef4ff' : '#ebfef6', color: activity.type === 'NEW_USER' ? '#3b82f6' : '#10b981' }}>
                                {activity.avatarUrl ? (
                                  <img src={activity.avatarUrl} alt="avatar" className="rounded-circle w-100 h-100 object-fit-cover" />
                                ) : (
                                  <i className={`fa-solid ${activity.type === 'NEW_USER' ? 'fa-user' : 'fa-futbol'}`}></i>
                                )}
                              </div>
                              <div>
                                <h6 className="mb-0 fw-semibold text-dark">{activity.name}</h6>
                                <small className="text-muted">{activity.description}</small>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`badge rounded-pill ${activity.type === 'NEW_USER' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'}`}>
                              {activity.type === 'NEW_USER' ? 'Thành viên mới' : 'Trận đấu mới'}
                            </span>
                          </td>
                          <td className="py-3 text-muted small">
                            {format(new Date(activity.timestamp), "HH:mm, dd MMM yyyy", { locale: vi })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-muted">Không có hoạt động nào gần đây</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
