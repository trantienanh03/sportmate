import React, { useEffect, useState } from "react";
import { adminCategoryService } from "../../../services/adminService";

interface Sport {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
  displayOrder?: number;
  isActive: boolean;
}

interface Venue {
  id: number;
  name: string;
  address: string;
  district: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
  verified: boolean;
  usageCount: number;
}

const emptySport = (): Partial<Sport> => ({ name: "", slug: "", iconUrl: "", isActive: true });
const emptyVenue = (): Partial<Venue> => ({ name: "", address: "", district: "", lat: undefined, lng: undefined, googleMapsUrl: "", verified: false });

const AdminCategories: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sports");

  // Sport modal state
  const [sportModal, setSportModal] = useState(false);
  const [editingSport, setEditingSport] = useState<Partial<Sport>>(emptySport());
  const [sportSaving, setSportSaving] = useState(false);

  // Venue modal state
  const [venueModal, setVenueModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Partial<Venue>>(emptyVenue());
  const [venueSaving, setVenueSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await adminCategoryService.getAll();
      setSports(data.sports || []);
      setVenues(data.venues || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // ── Sport handlers ─────────────────────────────────────────────────────────
  const openSportModal = (sport?: Sport) => {
    setEditingSport(sport ? { ...sport } : emptySport());
    setSportModal(true);
  };

  const saveSport = async () => {
    setSportSaving(true);
    try {
      const isEdit = !!editingSport.id;
      const saved: Sport = isEdit
        ? await adminCategoryService.updateSport(editingSport.id!, editingSport)
        : await adminCategoryService.createSport(editingSport);
      if (isEdit) {
        setSports(sports.map(s => s.id === saved.id ? saved : s));
      } else {
        setSports([...sports, saved]);
      }
      setSportModal(false);
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi");
    } finally {
      setSportSaving(false);
    }
  };

  // ── Venue handlers ─────────────────────────────────────────────────────────
  const openVenueModal = (venue?: Venue) => {
    setEditingVenue(venue ? { ...venue } : emptyVenue());
    setVenueModal(true);
  };

  const saveVenue = async () => {
    setVenueSaving(true);
    try {
      const isEdit = !!editingVenue.id;
      const saved: Venue = isEdit
        ? await adminCategoryService.updateVenue(editingVenue.id!, editingVenue)
        : await adminCategoryService.createVenue(editingVenue);
      if (isEdit) {
        setVenues(venues.map(v => v.id === saved.id ? saved : v));
      } else {
        setVenues([...venues, saved]);
      }
      setVenueModal(false);
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi");
    } finally {
      setVenueSaving(false);
    }
  };

  const toggleVenueVisibility = async (id: number) => {
    try {
      await adminCategoryService.toggleVenueVisibility(id);
      setVenues(venues.map(v => v.id === id ? { ...v, verified: !v.verified } : v));
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="admin-categories bg-white p-4 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Quản Lý Danh Mục Sân & Môn</h5>
        {activeTab === "sports" ? (
          <button className="btn btn-primary btn-sm fw-bold" onClick={() => openSportModal()}>
            + Thêm Môn Thể Thao
          </button>
        ) : (
          <button className="btn btn-primary btn-sm fw-bold" onClick={() => openVenueModal()}>
            + Thêm Sân Bãi
          </button>
        )}
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'sports' ? 'active fw-bold' : 'text-muted'}`} onClick={() => setActiveTab('sports')}>
            Môn Thể Thao ({sports.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'venues' ? 'active fw-bold' : 'text-muted'}`} onClick={() => setActiveTab('venues')}>
            Địa Điểm Sân Bãi ({venues.length})
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-5">Đang tải...</div>
      ) : activeTab === 'sports' ? (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Icon</th>
                <th>Tên Môn</th>
                <th>Slug</th>
                <th>Thứ Tự</th>
                <th>Trạng Thái</th>
                <th className="text-end">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {sports.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4 text-muted">Chưa có môn thể thao nào</td></tr>
              ) : sports.map(s => (
                <tr key={s.id}>
                  <td>
                    {s.iconUrl ? (
                      <img src={s.iconUrl} alt={s.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="fw-semibold">{s.name}</td>
                  <td><span className="badge bg-light text-dark">{s.slug}</span></td>
                  <td>{s.displayOrder ?? '—'}</td>
                  <td>
                    {s.isActive
                      ? <span className="badge bg-success">Hiển thị</span>
                      : <span className="badge bg-secondary">Ẩn</span>}
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-secondary fw-medium" onClick={() => openSportModal(s)}>
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Tên Sân</th>
                <th>Địa Chỉ</th>
                <th>Khu Vực</th>
                <th>GPS</th>
                <th>Số Trận Đã Tổ Chức</th>
                <th>Trạng Thái</th>
                <th className="text-end">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {venues.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4 text-muted">Chưa có sân nào</td></tr>
              ) : venues.map(v => (
                <tr key={v.id}>
                  <td className="fw-semibold">{v.name}</td>
                  <td className="text-truncate" style={{ maxWidth: '220px' }} title={v.address}>{v.address || '—'}</td>
                  <td>{v.district || '—'}</td>
                  <td>
                    {v.lat && v.lng ? (
                      <a href={`https://maps.google.com/?q=${v.lat},${v.lng}`} target="_blank" rel="noreferrer" className="text-decoration-none small">
                        {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                      </a>
                    ) : <span className="text-muted">—</span>}
                  </td>
                  <td>{v.usageCount ?? 0}</td>
                  <td>
                    {v.verified
                      ? <span className="badge bg-success">Hiển thị</span>
                      : <span className="badge bg-warning text-dark">Đang ẩn</span>}
                  </td>
                  <td className="text-end d-flex gap-2 justify-content-end">
                    <button className="btn btn-sm btn-outline-secondary fw-medium" onClick={() => openVenueModal(v)}>
                      Sửa
                    </button>
                    <button
                      className={`btn btn-sm ${v.verified ? 'btn-outline-warning' : 'btn-outline-success'} fw-medium`}
                      onClick={() => toggleVenueVisibility(v.id)}
                    >
                      {v.verified ? 'Ẩn' : 'Hiện'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Sport Modal ───────────────────────────────────────────────────────── */}
      {sportModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1070 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1075 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">{editingSport.id ? "Sửa Môn Thể Thao" : "Thêm Môn Thể Thao"}</h5>
                  <button type="button" className="btn-close" onClick={() => setSportModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tên môn <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" value={editingSport.name || ""} onChange={e => setEditingSport({ ...editingSport, name: e.target.value })} placeholder="Bóng đá, Cầu lông, Pickleball..." />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Slug <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" value={editingSport.slug || ""} onChange={e => setEditingSport({ ...editingSport, slug: e.target.value })} placeholder="football, badminton, pickleball..." />
                    <small className="text-muted">Dùng chữ thường, không dấu, không khoảng trắng</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">URL Icon</label>
                    <input type="text" className="form-control" value={editingSport.iconUrl || ""} onChange={e => setEditingSport({ ...editingSport, iconUrl: e.target.value })} placeholder="https://..." />
                    {editingSport.iconUrl && (
                      <img src={editingSport.iconUrl} alt="preview" className="mt-2" style={{ height: 40, objectFit: 'contain' }} />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Thứ tự hiển thị</label>
                    <input type="number" className="form-control" value={editingSport.displayOrder ?? ""} onChange={e => setEditingSport({ ...editingSport, displayOrder: e.target.value ? Number(e.target.value) : undefined })} placeholder="1, 2, 3..." min="1" />
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="sportActive" checked={editingSport.isActive !== false} onChange={e => setEditingSport({ ...editingSport, isActive: e.target.checked })} />
                    <label className="form-check-label fw-semibold" htmlFor="sportActive">Hiển thị trên hệ thống</label>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setSportModal(false)}>Hủy</button>
                  <button type="button" className="btn btn-primary px-4 fw-bold" onClick={saveSport} disabled={sportSaving}>
                    {sportSaving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Venue Modal ───────────────────────────────────────────────────────── */}
      {venueModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1070 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1075 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">{editingVenue.id ? "Sửa Thông Tin Sân" : "Thêm Sân Bãi Mới"}</h5>
                  <button type="button" className="btn-close" onClick={() => setVenueModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label fw-semibold">Tên sân <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" value={editingVenue.name || ""} onChange={e => setEditingVenue({ ...editingVenue, name: e.target.value })} placeholder="Sân cầu lông Phú Nhuận..." />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">Quận/Huyện</label>
                      <input type="text" className="form-control" value={editingVenue.district || ""} onChange={e => setEditingVenue({ ...editingVenue, district: e.target.value })} placeholder="Phú Nhuận, Q.1..." />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Địa chỉ chi tiết</label>
                    <input type="text" className="form-control" value={editingVenue.address || ""} onChange={e => setEditingVenue({ ...editingVenue, address: e.target.value })} placeholder="123 Đường ABC, Phường XYZ..." />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Vĩ độ (Latitude)</label>
                      <input type="number" className="form-control" step="0.000001" value={editingVenue.lat ?? ""} onChange={e => setEditingVenue({ ...editingVenue, lat: e.target.value ? Number(e.target.value) : undefined })} placeholder="10.7769..." />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Kinh độ (Longitude)</label>
                      <input type="number" className="form-control" step="0.000001" value={editingVenue.lng ?? ""} onChange={e => setEditingVenue({ ...editingVenue, lng: e.target.value ? Number(e.target.value) : undefined })} placeholder="106.7009..." />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Google Maps URL</label>
                    <input type="text" className="form-control" value={editingVenue.googleMapsUrl || ""} onChange={e => setEditingVenue({ ...editingVenue, googleMapsUrl: e.target.value })} placeholder="https://maps.google.com/..." />
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="venueVerified" checked={!!editingVenue.verified} onChange={e => setEditingVenue({ ...editingVenue, verified: e.target.checked })} />
                    <label className="form-check-label fw-semibold" htmlFor="venueVerified">Hiển thị sân (đã xác thực)</label>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setVenueModal(false)}>Hủy</button>
                  <button type="button" className="btn btn-primary px-4 fw-bold" onClick={saveVenue} disabled={venueSaving}>
                    {venueSaving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCategories;
