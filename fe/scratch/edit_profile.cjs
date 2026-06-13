const fs = require('fs');
const file = 'c:/Project/sportmate/fe/src/pages/Profile/ProfilePage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update State & Hooks
content = content.replace(
  /const \[isEditing, setIsEditing\] = useState\(false\);/,
  `type EditorMode = 'none' | 'basic' | 'sports' | 'schedule';\n  const [activeEditor, setActiveEditor] = useState<EditorMode>('none');\n  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);`
);

content = content.replace(
  /useEffect\(\(\) => \{\n\s*if \(\!user\) return;\n\n\s*setFormData\(\{[\s\S]*?\}\);\n\n\s*if \(user\.sports[\s\S]*?\}\n\s*\}\, \[user\]\);/,
  `const resetFormToOriginal = () => {
    if (!user) return;
    setFormData({
      fullName: user.fullName ?? '',
      avatarUrl: user.avatarUrl ?? '',
      bio: user.bio ?? '',
      district: user.district ?? '',
      lat: toInputValue(user.lat),
      lng: toInputValue(user.lng),
    });
    setSportCards(user.sports && user.sports.length > 0 ? user.sports : SPORT_CARDS);
    setAvailabilitySlots(user.availability && user.availability.length > 0 ? user.availability : DEFAULT_WEEK_SLOTS);
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    resetFormToOriginal();
  }, [user]);`
);

content = content.replace(
  /document\.body\.style\.overflow = isEditing \? 'hidden' : '';/g,
  `document.body.style.overflow = activeEditor !== 'none' ? 'hidden' : '';`
);
content = content.replace(
  /\[isEditing\]\)/g,
  `[activeEditor])`
);

// 2. Add setHasUnsavedChanges(true) to handlers
content = content.replace(
  /setErrorMessage\(''\);\n\s*setSuccessMessage\(''\);\n\s*setFormData/g,
  `setErrorMessage('');\n      setSuccessMessage('');\n      setHasUnsavedChanges(true);\n      setFormData`
);
content = content.replace(
  /setErrorMessage\(''\);\n\s*setSuccessMessage\(''\);\n\s*setFormData\(\(current\) => \(\{\n\s*\.\.\.current,\n\s*avatarUrl: result/g,
  `setErrorMessage('');\n        setSuccessMessage('');\n        setHasUnsavedChanges(true);\n        setFormData((current) => ({\n          ...current,\n          avatarUrl: result`
);
content = content.replace(
  /setAvailabilitySlots\(\(current/g,
  `setHasUnsavedChanges(true);\n    setAvailabilitySlots((current`
);
content = content.replace(
  /setSportCards\(\(current\) => \[\n\s*\.\.\.current/g,
  `setHasUnsavedChanges(true);\n    setSportCards((current) => [\n      ...current`
);
content = content.replace(
  /setSportCards\(\(current\) => current\.filter/g,
  `setHasUnsavedChanges(true);\n    setSportCards((current) => current.filter`
);
content = content.replace(
  /setSportCards\(\(current\) =>\n\s*current\.map\(\(sport, sportIndex\) => \(sportIndex === index \? \{ \.\.\.sport, \[field\]: value \} : sport\)\),\n\s*\);/g,
  `setHasUnsavedChanges(true);\n    setSportCards((current) =>\n      current.map((sport, sportIndex) => (sportIndex === index ? { ...sport, [field]: value } : sport)),\n    );`
);

// 3. Open/Close Editor Logic
content = content.replace(
  /const openEditor = \(\) => \{\n\s*setErrorMessage\(''\);\n\s*setSuccessMessage\(''\);\n\s*setIsEditing\(true\);\n\s*setShowEditBanner\(true\);\n\s*\};/,
  `const openEditor = (mode: EditorMode) => {
    setErrorMessage('');
    setSuccessMessage('');
    resetFormToOriginal();
    setActiveEditor(mode);
    setShowEditBanner(true);
  };`
);
content = content.replace(
  /const closeEditor = \(\) => \{\n\s*setIsEditing\(false\);\n\s*setShowEditBanner\(false\);\n\s*\};/,
  `const closeEditor = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('Bạn có các thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy?')) {
        return;
      }
    }
    resetFormToOriginal();
    setActiveEditor('none');
    setShowEditBanner(false);
  };`
);

// 4. Update save logic
content = content.replace(
  /login\(updatedProfile\);\n\s*setIsEditing\(false\);/,
  `login(updatedProfile);\n      setHasUnsavedChanges(false);\n      setActiveEditor('none');`
);

// 5. Update UI Edit Buttons
content = content.replace(
  /onClick=\{openEditor\}/g,
  `onClick={() => openEditor('basic')}`
);
content = content.replace(
  /<div className="profile-card-header compact">\n\s*<div>\n\s*<h2 className="profile-card-title">Phong cách chơi<\/h2>\n\s*<\/div>\n\s*<\/div>/,
  `<div className="profile-card-header compact">
                    <div>
                      <h2 className="profile-card-title">Phong cách chơi</h2>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openEditor('sports')}>
                      <i className="fa-solid fa-pen me-1"></i> Sửa
                    </button>
                  </div>`
);
content = content.replace(
  /<div className="profile-card-header compact">\n\s*<div>\n\s*<h2 className="profile-card-title">Thời gian có thể ghép trận<\/h2>\n\s*<\/div>\n\s*<\/div>/,
  `<div className="profile-card-header compact">
                    <div>
                      <h2 className="profile-card-title">Thời gian có thể ghép trận</h2>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openEditor('schedule')}>
                      <i className="fa-solid fa-pen me-1"></i> Sửa
                    </button>
                  </div>`
);

// 6. Modal conditions
content = content.replace(
  /\{isEditing && \(/g,
  `{activeEditor !== 'none' && (`
);

content = content.replace(
  /<section className="profile-editor-section card-shell">\n\s*<div className="profile-editor-section-header">\n\s*<div>\n\s*<h3 className="profile-editor-section-title">Thông tin cơ bản<\/h3>/,
  `{activeEditor === 'basic' && (\n              <section className="profile-editor-section card-shell">\n                <div className="profile-editor-section-header">\n                  <div>\n                    <h3 className="profile-editor-section-title">Thông tin cơ bản</h3>`
);
content = content.replace(
  /<\/section>\n\n\s*<section className="profile-editor-section card-shell">\n\s*<div className="profile-editor-section-header">\n\s*<div>\n\s*<h3 className="profile-editor-section-title">Môn thể thao<\/h3>/,
  `</section>\n              )}\n\n              {activeEditor === 'sports' && (\n              <section className="profile-editor-section card-shell">\n                <div className="profile-editor-section-header\">\n                  <div>\n                    <h3 className="profile-editor-section-title">Môn thể thao</h3>`
);
content = content.replace(
  /<\/section>\n\n\s*<section className="profile-editor-section card-shell">\n\s*<div className="profile-editor-section-header">\n\s*<div>\n\s*<h3 className="profile-editor-section-title">Thời gian có thể ghép trận<\/h3>/,
  `</section>\n              )}\n\n              {activeEditor === 'schedule' && (\n              <section className="profile-editor-section card-shell">\n                <div className="profile-editor-section-header\">\n                  <div>\n                    <h3 className="profile-editor-section-title\">Thời gian có thể ghép trận</h3>`
);
content = content.replace(
  /<\/section>\n\n\s*\{errorMessage && \(/,
  `</section>\n              )}\n\n              {errorMessage && (`
);

fs.writeFileSync(file, content);
