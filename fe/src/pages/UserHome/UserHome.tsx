import React from 'react';
import LoggedInNavbar from '../../components/LoggedInNavbar/LoggedInNavbar';
import Footer from '../../components/Footer/Footer';
import './UserHome.css';

const UserHome: React.FC = () => {
  return (
    <div className="user-home-page">
      <LoggedInNavbar />

      <main className="user-home-main py-5">
        <div className="container">
          <div className="row">

            <div className="col-lg-3 col-md-4 mb-4">

              <div className="sidebar-card profile-card mb-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="profile-avatar me-3">
                    <span>T</span>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">tienanhtran1003</h6>
                    <small className="text-muted">Ho Chi Minh City</small>
                  </div>
                  <i className="fa-solid fa-chevron-right ms-auto text-muted"></i>
                </div>

              </div>

              <div className="sidebar-card mb-4 p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex gap-3">
                    <span className="fw-bold" style={{ cursor: 'pointer', borderBottom: '2px solid #212529', paddingBottom: '4px' }}>Going</span>
                    <span className="text-muted fw-medium" style={{ cursor: 'pointer' }}>Saved</span>
                  </div>
                  <a href="#" className="text-primary text-decoration-none small fw-bold">See all</a>
                </div>
                
                <div className="text-center py-3">
                  <h6 className="fw-bold mb-3">Looks like you're free</h6>
                  <button className="btn btn-dark rounded-pill px-4 py-2 fw-bold w-100">
                    Find events
                  </button>
                </div>
              </div>

              <div className="sidebar-card mb-4 p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="fw-bold mb-0">Your groups <span className="text-muted fw-normal ms-1">0</span></h6>
                  <a href="#" className="text-primary text-decoration-none small fw-bold">See all</a>
                </div>
                <div className="text-center">
                  <h6 className="fw-bold mb-2">Looking for your people?</h6>
                  <p className="text-muted small mb-3">Join a group that shares your passions—and start connecting today.</p>
                  <button className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold w-100">
                    Explore groups
                  </button>
                </div>
              </div>

            </div>

            <div className="col-lg-9 col-md-8 ps-lg-5">

              <div className="section-header d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0">For you</h4>
                <a href="#" className="text-primary text-decoration-none fw-bold">Browse all</a>
              </div>

              <div className="row g-4">
                <div className="col-lg-4 col-sm-6">
                  <div className="event-card">
                    <div className="event-img-wrapper">
                      <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=500&auto=format&fit=crop&q=60" alt="Event" className="event-img" />
                      <button className="like-btn"><i className="fa-regular fa-heart"></i></button>
                    </div>
                    <div className="event-details mt-3">
                      <h5 className="event-title fw-bold">Global Asian Social: Lounge Asia Meetup (Easy English) @...</h5>
                      <p className="event-time text-muted small fw-medium mb-1">Tue, May 12 · 7:00 PM AEST</p>
                      <p className="event-group text-muted small mb-1">by Asian Background Social: Lounge Asi • 4.7 <i className="fa-solid fa-star text-warning"></i></p>
                      <div className="d-flex align-items-center mt-2">
                        <div className="attendee-avatars">
                          <img src="https://i.pravatar.cc/150?img=11" alt="user" />
                          <img src="https://i.pravatar.cc/150?img=12" alt="user" />
                          <img src="https://i.pravatar.cc/150?img=13" alt="user" />
                        </div>
                        <span className="small text-muted ms-2 fw-medium">61 attendees</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-sm-6">
                  <div className="event-card">
                    <div className="event-img-wrapper">
                      <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=500&auto=format&fit=crop&q=60" alt="Event" className="event-img" />
                      <button className="like-btn"><i className="fa-regular fa-heart"></i></button>
                    </div>
                    <div className="event-details mt-3">
                      <h5 className="event-title fw-bold">Blame it on the hormones!</h5>
                      <p className="event-time text-muted small fw-medium mb-1">Sun, May 17 · 12:00 PM CST · <i className="fa-solid fa-video ms-1"></i> Online</p>
                      <p className="event-group text-muted small mb-1">by Alkya - The Perimenopause Commun • 4.8 <i className="fa-solid fa-star text-warning"></i></p>
                      <div className="d-flex align-items-center mt-2">
                        <div className="attendee-avatars">
                          <img src="https://i.pravatar.cc/150?img=21" alt="user" />
                          <img src="https://i.pravatar.cc/150?img=22" alt="user" />
                          <img src="https://i.pravatar.cc/150?img=23" alt="user" />
                        </div>
                        <span className="small text-muted ms-2 fw-medium">18 attendees</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-sm-6">
                  <div className="event-card">
                    <div className="event-img-wrapper">
                      <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=500&auto=format&fit=crop&q=60" alt="Event" className="event-img" />
                      <button className="like-btn"><i className="fa-regular fa-heart"></i></button>
                    </div>
                    <div className="event-details mt-3">
                      <h5 className="event-title fw-bold">Ho Chi Minh City ServiceNow Developer Meetup Q2 2026</h5>
                      <p className="event-time text-muted small fw-medium mb-1">Sat, May 16 · 9:00 AM ICT</p>
                      <p className="event-group text-muted small mb-1">by Ho Chi Minh City ServiceNow Devel • 5.0 <i className="fa-solid fa-star text-warning"></i></p>
                      <div className="d-flex align-items-center mt-2">
                        <div className="attendee-avatars">
                          <img src="https://i.pravatar.cc/150?img=31" alt="user" />
                          <img src="https://i.pravatar.cc/150?img=32" alt="user" />
                          <img src="https://i.pravatar.cc/150?img=33" alt="user" />
                        </div>
                        <span className="small text-muted ms-2 fw-medium">48 attendees</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-header d-flex justify-content-between align-items-center mt-5 mb-4">
                <h4 className="fw-bold m-0">From your groups</h4>
                <div className="dropdown">
                  <button className="btn filter-dropdown-btn dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Today
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                    <li><a className="dropdown-item" href="#">Today</a></li>
                    <li><a className="dropdown-item" href="#">Tomorrow</a></li>
                    <li><a className="dropdown-item" href="#">This week</a></li>
                    <li><a className="dropdown-item" href="#">This weekend</a></li>
                  </ul>
                </div>
              </div>

              <div className="empty-state text-center py-5 mb-5">
                <div className="empty-state-icon mb-3">
                  <i className="fa-solid fa-bed text-muted fa-3x"></i>
                  <div className="zzz text-primary fw-bold">Z z z</div>
                </div>
                <h5 className="fw-bold mb-2">Your groups are quiet for now</h5>
                <p className="text-muted mb-4">Explore fresh events and stay connected<br />with what's happening around you.</p>
                <button className="btn btn-dark rounded-pill px-4 py-2 fw-bold">
                  Discover events
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserHome;
