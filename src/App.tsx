import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownToLine, ArrowRight, Bell, CalendarDays,
  Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, CircleHelp,
  ClipboardCheck, CloudUpload, Command,
  Eye, FileCheck2, FileClock, FileSpreadsheet,
  FileText, Filter, FolderClosed, LayoutDashboard, ListChecks,
  LogOut, Menu, Plus, Search, Settings2, ShieldCheck, SlidersHorizontal,
  Sparkles, Target, TrendingUp, Users, X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStored, exportCSV, EntryForm, RecordDetail, CalendarPage, ReportsPage, SettingsPage, ProfileForm, HelpContent } from './features'

import { mayEdit, recordsForRole, allowedTransition, achievementPercent } from './model'

export type Role = 'Admin' | 'Operator' | 'Validator' | 'Pimpinan'
export type Page = 'dashboard' | 'sasaran' | 'iku' | 'capaian' | 'validasi' | 'dokumen' | 'bukti' | 'monitoring' | 'jadwal' | 'laporan' | 'permintaan' | 'notifikasi' | 'pengguna' | 'unit' | 'audit' | 'pengaturan'
export type Item = { id: string; title: string; meta: string; unit: string; date: string; status: string; value?: string; details?: Record<string,string>; attachment?: {id:string;name:string;type:string;size:number}; versions?: {id:string;name:string;type:string;size:number}[]; history?: {at:string;action:string;note:string}[] }
type NavItem = { id: Page; title: string; icon: LucideIcon; roles?: Role[] }

const logo = '/bps-logo.png'
const navGroups: { title: string; items: NavItem[] }[] = [
  { title: 'RUANG KERJA', items: [
    { id: 'dashboard', title: 'Beranda', icon: LayoutDashboard },
    { id: 'sasaran', title: 'Sasaran strategis', icon: Target },
    { id: 'iku', title: 'IKU & target', icon: ListChecks },
    { id: 'capaian', title: 'Capaian kinerja', icon: TrendingUp },
    { id: 'validasi', title: 'Validasi', icon: ClipboardCheck },
  ] },
  { title: 'DOKUMEN & ANALISIS', items: [
    { id: 'dokumen', title: 'Arsip dokumen', icon: FolderClosed },
    { id: 'bukti', title: 'Bukti pendukung', icon: FileCheck2 },
    { id: 'monitoring', title: 'Monitoring', icon: Activity },
    { id: 'jadwal', title: 'Jadwal', icon: CalendarDays },
    { id: 'laporan', title: 'Laporan', icon: FileSpreadsheet },
    { id: 'permintaan', title: 'Permintaan dokumen', icon: FileClock },
  ] },
  { title: 'SISTEM', items: [
    { id: 'notifikasi', title: 'Notifikasi', icon: Bell },
    { id: 'pengguna', title: 'Pengguna', icon: Users, roles: ['Admin'] },
    { id: 'unit', title: 'Unit kerja', icon: Command, roles: ['Admin'] },
    { id: 'audit', title: 'Audit aktivitas', icon: ShieldCheck, roles: ['Admin'] },
    { id: 'pengaturan', title: 'Pengaturan', icon: Settings2, roles: ['Admin'] },
  ] },
]

const seed: Record<string, Item[]> = {
  sasaran: [
    { id: 'SS-01', title: 'Meningkatnya pemanfaatan data statistik yang berkualitas', meta: '3 indikator kinerja utama', unit: 'BPS Provinsi Kalimantan Timur', date: '2026', status: 'Aktif' },
    { id: 'SS-02', title: 'Menguatnya tata kelola kelembagaan dan akuntabilitas kinerja', meta: '4 indikator kinerja utama', unit: 'Sekretariat', date: '2026', status: 'Aktif' },
    { id: 'SS-03', title: 'Meningkatnya pelayanan dan literasi statistik', meta: '2 indikator kinerja utama', unit: 'Fungsi Diseminasi', date: '2026', status: 'Aktif' },
  ],
  iku: [
    { id: 'IKU-01', title: 'Persentase publikasi statistik yang terbit tepat waktu', meta: 'Target tahunan 100%', unit: 'Fungsi Diseminasi', date: '2026', status: 'Aktif', value: '95%' },
    { id: 'IKU-02', title: 'Persentase kepuasan pengguna data statistik', meta: 'Target tahunan 92%', unit: 'Fungsi Diseminasi', date: '2026', status: 'Aktif', value: '91,2%' },
    { id: 'IKU-03', title: 'Persentase rekomendasi hasil evaluasi yang ditindaklanjuti', meta: 'Target tahunan 90%', unit: 'Sekretariat', date: '2026', status: 'Aktif', value: '88%' },
    { id: 'IKU-04', title: 'Nilai akuntabilitas kinerja instansi pemerintah', meta: 'Target tahunan 82', unit: 'Sekretariat', date: '2026', status: 'Aktif', value: '81,5' },
  ],
  capaian: [
    { id: 'CAP-026', title: 'Publikasi statistik terbit tepat waktu', meta: 'IKU-01 · Triwulan III', unit: 'Fungsi Diseminasi', date: '08 Okt 2026', status: 'Disetujui', value: '95%' },
    { id: 'CAP-025', title: 'Kepuasan pengguna data statistik', meta: 'IKU-02 · Triwulan III', unit: 'Fungsi Diseminasi', date: '07 Okt 2026', status: 'Menunggu validasi', value: '91,2%' },
    { id: 'CAP-024', title: 'Rekomendasi evaluasi ditindaklanjuti', meta: 'IKU-03 · Triwulan III', unit: 'Sekretariat', date: '06 Okt 2026', status: 'Perlu perbaikan', value: '88%' },
    { id: 'CAP-023', title: 'Nilai akuntabilitas kinerja', meta: 'IKU-04 · Triwulan III', unit: 'Sekretariat', date: '04 Okt 2026', status: 'Draft', value: '81,5' },
  ],
  dokumen: [
    { id: 'DOC-108', title: 'Perjanjian Kinerja BPS Provinsi Kalimantan Timur 2026', meta: 'Perjanjian Kinerja · PDF · v2', unit: 'Sekretariat', date: '12 Sep 2026', status: 'Final' },
    { id: 'DOC-107', title: 'Rencana Strategis BPS Kalimantan Timur 2025–2029', meta: 'Renstra · PDF · v3', unit: 'Sekretariat', date: '29 Agu 2026', status: 'Final' },
    { id: 'DOC-106', title: 'Monitoring Capaian Kinerja Triwulan III 2026', meta: 'Monitoring · XLSX · v1', unit: 'Tim SAKIP', date: '08 Okt 2026', status: 'Internal' },
    { id: 'DOC-105', title: 'Laporan Kinerja Tahun 2026', meta: 'LAKIN · DOCX · v1', unit: 'Sekretariat', date: '01 Okt 2026', status: 'Draft' },
  ],
  bukti: [
    { id: 'BKT-084', title: 'Rekap jadwal rilis publikasi triwulan III', meta: 'IKU-01 · PDF', unit: 'Fungsi Diseminasi', date: '08 Okt 2026', status: 'Terverifikasi' },
    { id: 'BKT-083', title: 'Hasil survei kepuasan pengguna data', meta: 'IKU-02 · XLSX', unit: 'Fungsi Diseminasi', date: '07 Okt 2026', status: 'Menunggu verifikasi' },
    { id: 'BKT-082', title: 'Matriks tindak lanjut hasil evaluasi', meta: 'IKU-03 · PDF', unit: 'Sekretariat', date: '06 Okt 2026', status: 'Perlu perbaikan' },
  ],
  permintaan: [
    { id: 'REQ-013', title: 'Bukti tindak lanjut rekomendasi evaluasi', meta: 'Permintaan Tim SAKIP', unit: 'Sekretariat', date: '18 Nov 2026', status: 'Belum tersedia' },
    { id: 'REQ-012', title: 'Dokumen pengukuran kinerja triwulan III', meta: 'Permintaan Tim SAKIP', unit: 'Fungsi Diseminasi', date: '14 Nov 2026', status: 'Dalam proses' },
    { id: 'REQ-011', title: 'Daftar hadir rapat evaluasi kinerja', meta: 'Permintaan Tim SAKIP', unit: 'Sekretariat', date: '04 Nov 2026', status: 'Tersedia' },
  ],
  pengguna: [
    { id: 'USR-01', title: 'Rina Puspita', meta: 'rina.puspita@bps.go.id · Admin', unit: 'Sekretariat', date: 'Hari ini', status: 'Aktif' },
    { id: 'USR-02', title: 'Andi Pratama', meta: 'andi.pratama@bps.go.id · Operator', unit: 'Fungsi Diseminasi', date: 'Kemarin', status: 'Aktif' },
    { id: 'USR-03', title: 'Dewi Lestari', meta: 'dewi.lestari@bps.go.id · Validator', unit: 'Tim SAKIP', date: '08 Nov 2026', status: 'Aktif' },
    { id: 'USR-04', title: 'Bima Saputra', meta: 'bima.saputra@bps.go.id · Pimpinan', unit: 'Pimpinan', date: '07 Nov 2026', status: 'Aktif' },
  ],
  unit: [
    { id: 'UNIT-01', title: 'Sekretariat', meta: '12 pengguna · 4 IKU', unit: 'BPS Provinsi Kalimantan Timur', date: '2026', status: 'Aktif' },
    { id: 'UNIT-02', title: 'Fungsi Diseminasi', meta: '8 pengguna · 3 IKU', unit: 'BPS Provinsi Kalimantan Timur', date: '2026', status: 'Aktif' },
    { id: 'UNIT-03', title: 'Fungsi Statistik Sosial', meta: '9 pengguna · 2 IKU', unit: 'BPS Provinsi Kalimantan Timur', date: '2026', status: 'Aktif' },
    { id: 'UNIT-04', title: 'Fungsi Statistik Produksi', meta: '7 pengguna · 2 IKU', unit: 'BPS Provinsi Kalimantan Timur', date: '2026', status: 'Aktif' },
  ],
  audit: [
    { id: 'LOG-204', title: 'Capaian CAP-026 disetujui', meta: 'Dewi Lestari · Persetujuan', unit: 'Tim SAKIP', date: 'Hari ini, 09.42', status: 'Tercatat' },
    { id: 'LOG-203', title: 'Dokumen DOC-108 diunduh', meta: 'Bima Saputra · Unduhan', unit: 'Pimpinan', date: 'Hari ini, 08.16', status: 'Tercatat' },
    { id: 'LOG-202', title: 'Target IKU-02 diperbarui', meta: 'Rina Puspita · Perubahan data', unit: 'Sekretariat', date: 'Kemarin, 15.24', status: 'Tercatat' },
  ],
}

const config: Partial<Record<Page, { title: string; desc: string; action: string; columns: [string, string, string] }>> = {
  sasaran: { title: 'Sasaran strategis', desc: 'Arah kinerja yang menjadi dasar indikator dan target organisasi.', action: 'Tambah sasaran', columns: ['Sasaran', 'Unit penanggung jawab', 'Periode'] },
  iku: { title: 'IKU & target', desc: 'Kelola indikator kinerja utama beserta target tahunannya.', action: 'Tambah IKU', columns: ['Indikator', 'Unit penanggung jawab', 'Realisasi'] },
  capaian: { title: 'Capaian kinerja', desc: 'Pantau pengisian realisasi dan proses pengajuan tiap periode.', action: 'Isi capaian', columns: ['Indikator', 'Unit kerja', 'Realisasi'] },
  dokumen: { title: 'Arsip dokumen', desc: 'Semua dokumen SAKIP tersusun, terlacak, dan mudah ditemukan.', action: 'Unggah dokumen', columns: ['Dokumen', 'Pemilik', 'Diperbarui'] },
  bukti: { title: 'Bukti pendukung', desc: 'Berkas pendukung capaian yang terhubung dengan setiap IKU.', action: 'Unggah bukti', columns: ['Bukti', 'Unit kerja', 'Diunggah'] },
  permintaan: { title: 'Permintaan dokumen', desc: 'Lacak kelengkapan dan tenggat permintaan berkas.', action: 'Buat permintaan', columns: ['Dokumen diminta', 'Unit kerja', 'Tenggat'] },
  pengguna: { title: 'Pengguna', desc: 'Kelola akun, peran, dan akses setiap unit kerja.', action: 'Tambah pengguna', columns: ['Pengguna', 'Unit kerja', 'Aktivitas'] },
  unit: { title: 'Unit kerja', desc: 'Daftar unit yang terlibat dalam pengelolaan SAKIP.', action: 'Tambah unit', columns: ['Unit kerja', 'Organisasi', 'Periode'] },
  audit: { title: 'Audit aktivitas', desc: 'Riwayat tindakan penting dalam sistem.', action: 'Unduh log', columns: ['Aktivitas', 'Unit kerja', 'Waktu'] },
}

function Badge({ status }: { status: string }) {
  const tone = /perbaikan|belum|nonaktif/i.test(status) ? 'danger' : /menunggu|proses|mendekati/i.test(status) ? 'warning' : /disetujui|terverifikasi|final|aktif|tersedia|tercatat|tercapai|dikunci/i.test(status) ? 'success' : 'neutral'
  return <span className={`badge badge-${tone}`}><span className="badge-dot" />{status}</span>
}

function App() {
  const [role, setRole] = useState<Role>('Admin')
  const [page, setPage] = useState<Page>('dashboard')
  const [sidebar, setSidebar] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Semua status')
  const [period, setPeriod] = useState('2026')
  const [modal, setModal] = useState<'form' | 'detail' | 'login' | 'profile' | 'help' | 'search' | null>(null)
  const [selected, setSelected] = useState<Item | null>(null)
  const [items, setItems] = useStored<Record<string,Item[]>>('aksara-records-v1',seed)
  const [toast, setToast] = useState('')
  const [unread, setUnread] = useStored('aksara-unread',3)

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 3500); return () => clearTimeout(t) }, [toast])
  useEffect(() => { document.body.classList.toggle('modal-open', !!modal || sidebar); return () => document.body.classList.remove('modal-open') }, [modal, sidebar])
  useEffect(() => { if (role !== 'Admin' && ['pengguna', 'unit', 'audit', 'pengaturan'].includes(page)) setPage('dashboard') }, [role, page])

  useEffect(() => {
    if(!modal)return
    const previous=document.activeElement as HTMLElement
    const dialog=document.querySelector<HTMLElement>('[role="dialog"]')
    dialog?.querySelector<HTMLElement>('input,button,select,textarea')?.focus()
    function handleKey(e: KeyboardEvent) {
      if(e.key==='Escape')setModal(null)
      if(e.key==='Tab'&&dialog){const controls=Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]),input,select,textarea,a[href]')).filter(el=>el.getClientRects().length);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}
    }
    document.addEventListener('keydown',handleKey)
    return()=>{document.removeEventListener('keydown',handleKey);previous?.focus()}
  },[modal])

  const navigate = (next: Page) => { setPage(next); setSearch(''); setFilter('Semua status'); setSidebar(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const scopedItems = useMemo(() => recordsForRole(items,role),[items,role])
  const selectedKind = (Object.keys(items).find(key=>items[key].some(i=>i.id===selected?.id))||page) as Page
  const visible = useMemo(() => (scopedItems[page] || []).filter(item => {
    const textMatch = `${item.title} ${item.id} ${item.unit} ${item.meta}`.toLowerCase().includes(search.toLowerCase())
    return textMatch && (filter === 'Semua status' || item.status === filter)
  }), [scopedItems, page, search, filter])
  useEffect(()=>{const warn=()=>setToast('Penyimpanan browser penuh. Perubahan sesi ini belum tersimpan permanen.');window.addEventListener('aksara-storage-error',warn);return()=>window.removeEventListener('aksara-storage-error',warn)},[])
  const notify = (message: string) => setToast(message)
  const canEdit = mayEdit(role,page)

  function saveItem(item: Item) {
    if (!mayEdit(role,page,selected || undefined)) { notify('Data ini tidak dapat diubah oleh peran Anda.'); return }
    const editing = !!selected
    setItems(current => ({...current, [page]: editing ? (current[page] || []).map(row => row.id === item.id ? item : row) : [item, ...(current[page] || [])], audit: [{id:'LOG-'+Date.now(), title:(editing?'Memperbarui ':'Menambahkan ')+item.title, meta:role+' · '+item.id, unit:item.unit, date:new Date().toLocaleString('id-ID'), status:'Tercatat'}, ...(current.audit || [])]}))
    setUnread(v=>v+1); setModal(null); setSelected(null); notify('Data berhasil disimpan')
  }
  function changeStatus(status: string, note = '') {
    if (!selected) return
    if (!allowedTransition(role,selectedKind,selected,status)) { notify('Perubahan status ini tidak tersedia.'); return }
    if (selectedKind==='capaian' && status==='Perlu perbaikan' && !note.trim()) { notify('Catatan perbaikan wajib diisi.'); return }
    const updated = {...selected,status,details:{...selected.details,...(status==='Diarsipkan'?{statusSebelumArsip:selected.status}:{})},history:[...(selected.history||[]),{at:new Date().toLocaleString('id-ID'),action:status,note}]}
    setItems(current => {const next={...current};for(const key of Object.keys(next))next[key]=next[key].map(row=>row.id===selected.id?updated:row);next.audit=[{id:'LOG-'+Date.now(),title:selected.title+' — '+status,meta:role+' · '+note,unit:selected.unit,date:new Date().toLocaleString('id-ID'),status:'Tercatat'},...(next.audit||[])];return next})
    setUnread(v=>v+1); setSelected(updated); notify('Status diperbarui: '+status)
  }

  function openDetail(item: Item) { setSelected(item); setModal('detail') }

  return <div className="app-shell">
    <a className="skip-link" href="#main">Lewati ke konten</a>
    {sidebar && <button className="mobile-scrim" aria-label="Tutup menu" onClick={() => setSidebar(false)} />}
    <aside className={`sidebar ${sidebar ? 'sidebar-open' : ''}`} aria-label="Navigasi utama">
      <div className="brand" onClick={() => navigate('dashboard')} role="presentation">
        <img src={logo} width="46" height="36" alt="Logo BPS" />
        <div><strong>AKSARA<span className="brand-period">.</span></strong><small>BPS KALIMANTAN TIMUR</small></div>
      </div>
      <div className="workspace-pill"><span className="workspace-mark"><Sparkles size={16} /></span><span><b>Ruang kerja SAKIP</b><small>Tahun kinerja {period}</small></span><ChevronDown size={15} /></div>
      <nav className="nav-list">
        {navGroups.map(group => {
          const links = group.items.filter(item => !item.roles || item.roles.includes(role))
          return <div className="nav-group" key={group.title}><p className="nav-label">{group.title}</p><ul>{links.map(({ id, title, icon: Icon }) => <li key={id}><button className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => navigate(id)} aria-current={page === id ? 'page' : undefined}><Icon size={18} strokeWidth={1.9} /><span>{title}</span>{id === 'notifikasi' && unread > 0 && <em>{unread}</em>}</button></li>)}</ul></div>
        })}
      </nav>
      <div className="sidebar-bottom"><div className="support-card"><span className="support-icon"><CircleHelp size={19} /></span><b>Butuh bantuan?</b><p>Panduan singkat penggunaan AKSARA tersedia untuk tiap peran.</p><button onClick={() => setModal('help')}>Lihat panduan <ArrowRight size={14} /></button></div><p>© 2026 BPS Provinsi Kalimantan Timur</p></div>
    </aside>

    <div className="content-shell">
      <header className="topbar"><div className="topbar-left"><button className="icon-button menu-button" aria-label="Buka menu" onClick={() => setSidebar(true)}><Menu size={22} /></button><span className="breadcrumb">AKSARA <ChevronRight size={14} /> <b>{page === 'dashboard' ? 'Beranda' : config[page]?.title || navGroups.flatMap(g => g.items).find(i => i.id === page)?.title}</b></span></div><div className="topbar-right"><span className="demo-label"><span /> MODE DEMO</span><button className="icon-button top-search" aria-label="Cari" onClick={() => { setSearch(''); setModal('search') }}><Search size={19} /></button><button className="icon-button notification-button" aria-label={`Notifikasi, ${unread} belum dibaca`} onClick={() => navigate('notifikasi')}><Bell size={19} />{unread > 0 && <i />}</button><span className="topbar-divider" /><div className="role-switch"><button className="avatar-button" onClick={() => setRoleOpen(!roleOpen)} aria-expanded={roleOpen}><span className="avatar">{role[0]}</span><span className="avatar-info"><b>{role === 'Admin' ? 'Rina Puspita' : role === 'Operator' ? 'Andi Pratama' : role === 'Validator' ? 'Dewi Lestari' : 'Bima Saputra'}</b><small>{role}</small></span><ChevronDown size={15} /></button>{roleOpen && <div className="role-menu"><p>Ganti tampilan peran</p>{(['Admin', 'Operator', 'Validator', 'Pimpinan'] as Role[]).map(r => <button key={r} onClick={() => { setRole(r); setRoleOpen(false); navigate('dashboard') }}><span className="role-avatar">{r[0]}</span>{r}{role === r && <Check size={16} />}</button>)}<button onClick={() => { setRoleOpen(false); setModal('profile') }}><Users size={16} /> Profil saya</button><button className="role-logout" onClick={() => { setRoleOpen(false); setModal('login') }}><LogOut size={16} /> Lihat halaman masuk</button></div>}</div></div></header>
      <main id="main" className="main-content" key={page}>
        {page === 'dashboard' ? <Dashboard role={role} period={period} setPeriod={setPeriod} navigate={navigate} openDetail={openDetail} items={scopedItems} /> :
          page === 'validasi' ? <Validation items={scopedItems.capaian || []} role={role} openDetail={openDetail} notify={notify} /> :
          page === 'monitoring' ? <Monitoring period={period} setPeriod={setPeriod} items={scopedItems} /> :
          page === 'jadwal' ? <CalendarPage role={role} /> :
          page === 'laporan' ? <ReportsPage items={scopedItems} role={role} /> :
          page === 'notifikasi' ? <Notifications unread={unread} setUnread={setUnread} navigate={navigate} events={(items.audit || []).filter(event=>role!=='Operator'||event.unit==='Fungsi Diseminasi')} /> :
          page === 'pengaturan' ? <SettingsPage notify={notify} /> :
          <DataPage page={page} role={role} rows={visible} allRows={scopedItems[page] || []} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} onAdd={() => { setSelected(null); setModal('form') }} openDetail={openDetail} canEdit={canEdit} notify={notify} />}
      </main>
    </div>
    {toast && <div className="toast" role="status"><span><Check size={16} /></span>{toast}<button onClick={() => setToast('')} aria-label="Tutup pesan"><X size={16} /></button></div>}
    {modal && <div className="modal-scrim" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null) }}><section className={`modal ${modal === 'detail' ? 'detail-modal' : ''} ${modal === 'login' ? 'login-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="modal-close icon-button" onClick={() => setModal(null)} aria-label="Tutup"><X size={19} /></button>
      {modal === 'form' && <EntryForm role={role} indicators={scopedItems.iku || []} page={page} initial={selected} onSave={saveItem} onCancel={()=>setModal(null)} />}
      {modal === 'detail' && selected && <RecordDetail item={selected} role={role} kind={selectedKind} editable={mayEdit(role,selectedKind,selected)} onEdit={()=>{const source=Object.keys(items).find(key=>key!=='audit'&&items[key].some(i=>i.id===selected.id));if(source)setPage(source as Page);setModal('form')}} onStatus={changeStatus} onArchive={()=>changeStatus('Diarsipkan','Dipindahkan ke arsip; dapat dipulihkan')} />}
      {modal === 'search' && <><div className="modal-heading"><span className="eyebrow">PENCARIAN GLOBAL</span><h2 id="modal-title">Temukan data AKSARA</h2><p>Cari judul, kode, atau unit kerja.</p></div><div className="global-search"><input autoFocus aria-label="Cari seluruh data" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ketik kata kunci…"/><div className="global-search-results">{Object.entries(scopedItems).filter(([key])=>role==='Admin'||!['pengguna','audit','unit'].includes(key)).flatMap(([key,rows])=>rows.filter(r=>(r.title+' '+r.id+' '+r.unit).toLowerCase().includes(search.toLowerCase())).map(r=><button key={r.id} onClick={()=>{setPage(key as Page);setSelected(r);setModal('detail')}}><FileText size={18}/><span><b>{r.title}</b><small>{r.id} · {r.unit}</small></span><ArrowRight size={16}/></button>))}</div></div></>}
      {modal === 'profile' && <ProfileForm role={role} notify={notify}/>}
      {modal === 'help' && <HelpContent/>}
      {modal === 'login' && <div className="login-preview"><img src={logo} width="69" height="54" alt="Logo BPS" /><span className="eyebrow">BPS PROVINSI KALIMANTAN TIMUR</span><h2 id="modal-title">Selamat datang di AKSARA.</h2><p>Satu ruang kerja untuk dokumen, capaian, dan akuntabilitas kinerja.</p><form onSubmit={e => { e.preventDefault(); setModal(null); notify('Berhasil masuk ke tampilan demo') }}><label>Email atau nama pengguna<input type="email" required placeholder="nama@bps.go.id" autoComplete="username" /></label><label>Kata sandi<input type="password" required placeholder="Masukkan kata sandi" autoComplete="current-password" /></label><button className="button primary" type="submit">Masuk ke AKSARA <ArrowRight size={16} /></button></form><small>Mode demo · gunakan email dan kata sandi apa saja</small></div>}
    </section></div>}
  </div>
}

function PageHeader({ eyebrow, title, desc, action, onAction, icon: Icon }: { eyebrow: string; title: string; desc: string; action?: string; onAction?: () => void; icon?: LucideIcon }) {
  return <div className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{desc}</p></div>{action && <button className="button primary" onClick={onAction}>{Icon && <Icon size={17} />}{action}</button>}</div>
}

function Dashboard({ role, period, setPeriod, navigate, openDetail, items }: { role: Role; period: string; setPeriod: (v: string) => void; navigate: (v: Page) => void; openDetail: (v: Item) => void; items: Record<string, Item[]> }) {
  const [preferences]=useStored('aksara-settings',{reminder:true})
  const capaian = items.capaian || []
  const pending = capaian.filter(i => i.status === 'Menunggu validasi')
  const repair = capaian.filter(i => i.status === 'Perlu perbaikan')
  const approved = capaian.filter(i => ['Disetujui','Dikunci'].includes(i.status))
  const actionable = role === 'Operator' ? capaian.filter(i => ['Draft', 'Perlu perbaikan'].includes(i.status)) : role === 'Pimpinan' ? capaian.filter(i => ['Disetujui','Dikunci'].includes(i.status)) : capaian.filter(i => ['Menunggu validasi', 'Perlu perbaikan'].includes(i.status))
  const metrics = [
    { label: 'IKU aktif', count: (items.iku || []).length, description: 'Indikator pada data contoh', page: 'iku' as Page },
    { label: 'Menunggu validasi', count: pending.length, description: 'Capaian diajukan', page: 'validasi' as Page },
    { label: 'Perlu perbaikan', count: repair.length, description: 'Memiliki catatan', page: 'capaian' as Page },
    { label: 'Dokumen', count: (items.dokumen || []).length, description: 'Tersimpan di arsip', page: 'dokumen' as Page },
  ]
  return <>
    <div className="workspace-heading"><div><span className="eyebrow">AKSARA / RUANG KERJA {role.toUpperCase()}</span><h1>Ringkasan kinerja</h1><p>Data contoh SAKIP BPS Provinsi Kalimantan Timur · Tahun 2026</p></div><label className="period-select"><CalendarDays size={18} /><span>Tahun kinerja</span><select value={period} onChange={e => setPeriod(e.target.value)}><option>2026</option><option disabled>2025 · belum tersedia</option><option disabled>2024 · belum tersedia</option></select><ChevronDown size={16} /></label></div>
    <section className="metric-band" aria-label="Ringkasan data contoh">{metrics.map(metric => <button key={metric.label} onClick={() => navigate(metric.page)}><span>{metric.label}</span><strong>{metric.count.toString().padStart(2, '0')}</strong><small>{metric.description}</small><ArrowRight size={17} /></button>)}</section>
    <div className="dashboard-grid dashboard-grid-v2"><section className="surface-card work-panel"><div className="section-head"><div><span className="eyebrow">ALUR KERJA / 01</span><h2>{role === 'Operator' ? 'Perlu dilengkapi' : role === 'Pimpinan' ? 'Capaian yang disetujui' : 'Perlu ditinjau'}</h2><p>{role === 'Operator' ? 'Selesaikan data sebelum diajukan.' : role === 'Pimpinan' ? 'Hasil yang sudah melewati pemeriksaan.' : 'Capaian yang menunggu keputusan atau perbaikan.'}</p></div><button className="subtle-button" onClick={() => navigate(role === 'Validator' ? 'validasi' : 'capaian')}>Semua capaian <ArrowRight size={17} /></button></div><div className="work-list">{actionable.map((item, index) => <button key={item.id} onClick={() => openDetail(item)}><span className="work-index">0{index + 1}</span><span className="work-copy"><b>{item.title}</b><small>{item.id} · {item.unit} · {item.meta}</small></span><Badge status={item.status} /><ChevronRight size={18} /></button>)}{actionable.length === 0 && <p className="work-empty">Tidak ada capaian yang perlu ditindaklanjuti pada data contoh ini.</p>}</div></section>
    <section className="surface-card overview-panel"><div className="section-head"><div><span className="eyebrow">STATUS DATA / 02</span><h2>Alur capaian</h2><p>{capaian.length} data capaian pada contoh</p></div></div><div className="status-breakdown">{[['Disetujui',approved.length],['Menunggu validasi',pending.length],['Perlu perbaikan',repair.length],['Draft',capaian.filter(i => i.status === 'Draft').length]].map(([label,count]) => <div key={label}><span>{label}</span><strong>{count}</strong></div>)}</div><button className="overview-link" onClick={() => navigate('monitoring')}>Buka monitoring <ArrowRight size={17} /></button></section></div>
    <section className="surface-card performance-panel"><div className="section-head"><div><span className="eyebrow">ANALISIS INDIKATOR</span><h2>Realisasi terhadap target</h2><p>Capaian terbaru yang telah disetujui pada tahun 2026.</p></div><button className="subtle-button" onClick={()=>navigate('monitoring')}>Detail monitoring <ArrowRight size={17}/></button></div>{(items.iku||[]).map(item=>{const entry=(items.capaian||[]).find(a=>['Disetujui','Dikunci'].includes(a.status)&&(a.details?.iku||a.meta.split(' · ')[0])===item.id);const target=entry?.details?.target||item.details?.target||item.meta.match(/[0-9]+(?:[.,][0-9]+)?/)?.[0]||'100';const real=entry?.value||'';const ratio=achievementPercent(target,real);return <div className="performance-row" key={item.id}><div><b>{item.title}</b><small>Target {target} · Realisasi {real||'—'} · {item.unit}</small></div><div className="performance-track"><span style={{'--value':Math.max(0,Math.min(100,ratio||0))+'%'} as React.CSSProperties}/></div><strong>{ratio===null?'—':ratio.toLocaleString('id-ID',{maximumFractionDigits:1})+'%'}</strong></div>})}</section>
    {preferences.reminder&&<section className="surface-card deadline-panel"><div className="section-head"><div><span className="eyebrow">KELENGKAPAN DOKUMEN</span><h2>Tenggat & tindak lanjut</h2><p>Permintaan yang masih menunggu penyelesaian.</p></div><button className="subtle-button" onClick={()=>navigate('jadwal')}>Lihat kalender <CalendarDays size={17}/></button></div><div className="deadline-list">{(items.permintaan||[]).filter(i=>!['Tersedia','Diarsipkan'].includes(i.status)).map(item=><button key={item.id} onClick={()=>openDetail(item)}><CalendarDays size={19}/><span><b>{item.title}</b><small>{item.unit} · Tenggat {item.details?.deadline||item.date}</small></span><Badge status={item.status}/><ChevronRight size={16}/></button>)}</div></section>}
    <section className="surface-card register-panel"><div className="section-head"><div><span className="eyebrow">REGISTER / 03</span><h2>Capaian terbaru</h2></div><button className="subtle-button" onClick={() => navigate('capaian')}>Lihat daftar <ArrowRight size={17} /></button></div><div className="register-list">{capaian.map(item => <button key={item.id} onClick={() => openDetail(item)}><span className="register-id">{item.id}</span><span className="register-title">{item.title}<small>{item.unit}</small></span><span className="register-value">{item.value || '—'}</span><Badge status={item.status} /><ChevronRight size={17} /></button>)}</div></section>
  </>
}

function DataPage({ page, role, rows, allRows, search, setSearch, filter, setFilter, onAdd, openDetail, canEdit, notify }: { page: Page; role: Role; rows: Item[]; allRows: Item[]; search: string; setSearch: (v: string) => void; filter: string; setFilter: (v: string) => void; onAdd: () => void; openDetail: (v: Item) => void; canEdit: boolean; notify: (v: string) => void }) {
  const c = config[page]!
  const [sort,setSort]=useState('new')
  const [index,setIndex]=useState(0)
  useEffect(()=>setIndex(0),[search,filter,sort,page])
  const sorted=[...rows].sort((a,b)=>sort==='name'?a.title.localeCompare(b.title):sort==='status'?a.status.localeCompare(b.status):0)
  const paged=sorted.slice(index*8,index*8+8)
  const statuses = [...new Set(allRows.map(i => i.status))]
  const isDocument = page === 'dokumen' || page === 'bukti'
  return <><PageHeader eyebrow="PENGELOLAAN SAKIP" title={c.title} desc={c.desc} action={canEdit && page !== 'audit' ? c.action : undefined} onAction={onAdd} icon={isDocument ? CloudUpload : Plus} /><div className="summary-strip"><span className="summary-icon"><FileText size={21} /></span><div><b>{allRows.length} {page === 'pengguna' ? 'pengguna' : page === 'unit' ? 'unit kerja' : 'data'} tercatat</b><small>Data contoh untuk kebutuhan demonstrasi AKSARA</small></div><span className="summary-period">Periode 2026 <ChevronDown size={15} /></span></div><section className="surface-card data-card"><div className="data-toolbar"><div className="search-box"><Search size={18} /><input id="page-search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Cari ${c.title.toLowerCase()}...`} aria-label={`Cari ${c.title.toLowerCase()}`} /></div><div className="toolbar-actions"><select className="sort-select" aria-label="Urutkan data" value={sort} onChange={e=>setSort(e.target.value)}><option value="new">Urutan terbaru</option><option value="name">Nama A–Z</option><option value="status">Status</option></select><label className="filter-select"><Filter size={16} /><select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter status"><option>Semua status</option>{statuses.map(s => <option key={s}>{s}</option>)}</select><ChevronDown size={14} /></label><button className="button outline export-button" onClick={() => { exportCSV('AKSARA-'+page,rows); notify('Laporan CSV berhasil diunduh') }}><ArrowDownToLine size={16} /> Ekspor</button></div></div><div className="table-scroll"><table><thead><tr><th scope="col">{c.columns[0]}</th><th scope="col">{c.columns[1]}</th><th scope="col">{c.columns[2]}</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Aksi</span></th></tr></thead><tbody>{paged.map(item => <tr key={item.id}><td><button className="table-title" onClick={() => openDetail(item)}><span className={`file-icon ${isDocument ? 'file-icon-doc' : ''}`}>{isDocument ? <FileText size={18} /> : <Target size={18} />}</span><span><b>{item.title}</b><small>{item.id} · {item.meta}</small></span></button></td><td>{item.unit}</td><td>{page === 'iku' || page === 'capaian' ? item.value || '—' : item.date}</td><td><Badge status={item.status} /></td><td><button className="row-action" aria-label={`Lihat ${item.title}`} onClick={() => openDetail(item)}><ChevronRight size={18} /></button></td></tr>)}</tbody></table>{rows.length === 0 && <div className="empty-state"><Search size={24} /><b>Tidak ada data yang cocok</b><p>Coba kata kunci atau status lain.</p></div>}</div><div className="table-footer"><span>Menampilkan {paged.length} dari {rows.length} hasil · {allRows.length} data</span><div><button aria-label="Halaman sebelumnya" disabled={index===0} onClick={()=>setIndex(v=>v-1)}><ChevronLeft size={17} /></button><span>{index+1}</span><button aria-label="Halaman berikutnya" disabled={(index+1)*8>=rows.length} onClick={()=>setIndex(v=>v+1)}><ChevronRight size={17} /></button></div></div></section>{role === 'Pimpinan' && <p className="read-only-note"><Eye size={15} /> Tampilan pimpinan bersifat baca saja.</p>}</>
}

function Validation({ items, role, openDetail }: { items: Item[]; role: Role; openDetail: (v: Item) => void; notify: (v: string) => void }) {
  const [showHistory,setShowHistory]=useState(false)
  const pending = showHistory ? items : items.filter(i => i.status === 'Menunggu validasi' || i.status === 'Perlu perbaikan')
  return <><PageHeader eyebrow="ALUR PERSETUJUAN" title="Validasi capaian" desc="Tinjau realisasi, bukti, serta catatan sebelum data menjadi final." /><div className="validation-overview"><div><span className="step-number">01</span><span><b>Diajukan operator</b><small>Data dan bukti dilengkapi</small></span></div><ArrowRight size={18} /><div className="step-current"><span className="step-number">02</span><span><b>Ditinjau validator</b><small>Periksa dan beri keputusan</small></span></div><ArrowRight size={18} /><div><span className="step-number">03</span><span><b>Disetujui</b><small>Masuk monitoring final</small></span></div></div><div className="section-head standalone"><div><span className="eyebrow">ANTREAN VALIDASI</span><h2>{showHistory?'Seluruh pengajuan':'Perlu ditinjau'} <span className="count-bubble">{pending.length}</span></h2></div><span className="muted-caption">Seluruh periode · 2026</span></div><div className="validation-list">{pending.map(item => <article className="validation-card" key={item.id}><div className="validation-card-icon"><ClipboardCheck size={22} /></div><div className="validation-card-main"><div><span className="eyebrow">{item.id} / {item.meta}</span><Badge status={item.status} /></div><h3>{item.title}</h3><p>{item.unit} <span>·</span> Diajukan {item.date} <span>·</span> Realisasi {item.value}</p></div><button className="button outline" onClick={() => openDetail(item)}>{role === 'Validator' || role === 'Admin' ? 'Periksa detail' : 'Lihat detail'} <ArrowRight size={16} /></button></article>)}</div><button className="link-row" onClick={() => setShowHistory(!showHistory)}>{showHistory?'Tampilkan antrean aktif':'Lihat seluruh riwayat validasi'} <ArrowRight size={16} /></button></>
}

function Monitoring({ period, setPeriod, items }: { period: string; setPeriod: (v: string) => void; items: Record<string, Item[]> }) {
  const [quarter,setQuarter]=useState('Semua periode');const [unit,setUnit]=useState('Semua unit')
  const [thresholds]=useStored('aksara-settings',{target:'90',near:'75'})
  const indicators = (items.iku || []).filter(i=>unit==='Semua unit'||i.unit===unit)
  const achievements = (items.capaian || []).filter(i=>(unit==='Semua unit'||i.unit===unit)&&(quarter==='Semua periode'||(i.details?.periode||i.meta).match(/Triwulan (?:IV|III|II|I)\b/)?.[0]===quarter))
  const documents = (items.dokumen || []).filter(i=>unit==='Semua unit'||i.unit===unit)
  const approved = achievements.filter(i => ['Disetujui','Dikunci'].includes(i.status)).length
  const finalDocs = documents.filter(i => i.status === 'Final').length
  return <><PageHeader eyebrow="ANALISIS & PEMANTAUAN" title="Monitoring kinerja" desc="Status indikator, capaian, dan dokumen pada data simulasi." /><div className="monitor-filter"><label><CalendarDays size={17} /> Tahun <select value={period} onChange={e => setPeriod(e.target.value)}><option>2026</option><option disabled>2025 · belum tersedia</option><option disabled>2024 · belum tersedia</option></select></label><label><SlidersHorizontal size={17} /> Periode <select value={quarter} onChange={e=>setQuarter(e.target.value)}><option>Semua periode</option>{['I','II','III','IV'].map(q=><option key={q}>Triwulan {q}</option>)}</select></label><label>Unit <select value={unit} onChange={e=>setUnit(e.target.value)}><option>Semua unit</option>{[...new Set((items.iku||[]).map(i=>i.unit))].map(u=><option key={u}>{u}</option>)}</select></label></div><div className="monitor-summary"><div><span>Indikator aktif</span><strong>{indicators.length}</strong><small>IKU pada data contoh</small></div><div><span>Capaian disetujui</span><strong>{approved}<em> / {achievements.length}</em></strong><small>Data yang telah final</small></div><div><span>Dokumen final</span><strong>{finalDocs}<em> / {documents.length}</em></strong><small>Berkas pada arsip contoh</small></div></div><section className="surface-card monitor-table"><div className="section-head"><div><span className="eyebrow">REGISTER INDIKATOR</span><h2>Target dan realisasi</h2><p>Realisasi dari capaian yang disetujui. Warna mengikuti ambang pada pengaturan.</p></div></div><div className="monitor-rows">{indicators.map((item, i) => {const entry=achievements.find(a=>['Disetujui','Dikunci'].includes(a.status)&&(a.details?.iku||a.meta.split(' · ')[0])===item.id);const target=entry?.details?.target||item.details?.target||item.meta.match(/[0-9]+(?:[.,][0-9]+)?/)?.[0]||'';const ratio=achievementPercent(target,entry?.value||'');const status=ratio===null?'Belum diisi':ratio>=Number(thresholds.target)?'Tercapai':ratio>=Number(thresholds.near)?'Mendekati target':'Belum mencapai target';return <div key={item.id}><span className="monitor-index">0{i + 1}</span><span><b>{item.title}</b><small>{item.unit} · {item.meta}</small></span><strong>{ratio===null?'—':ratio.toLocaleString('id-ID',{maximumFractionDigits:1})+'%'}<small className="table-meta">Realisasi {entry?.value||'—'}</small></strong><Badge status={status} /></div>})}</div></section></>
}

function Notifications({ unread, setUnread, navigate, events }: { unread: number; setUnread: (v: number) => void; navigate: (v: Page) => void; events: Item[] }) {
  const notes = events.slice(0,20).map(e=>[e.title,e.meta,e.date,roleTarget(e.title)] as const)
  function roleTarget(title:string):Page {return /dokumen|berkas/i.test(title)?'dokumen':/IKU|target/i.test(title)?'iku':'capaian'}
  return <><PageHeader eyebrow="PEMBARUAN" title="Notifikasi" desc="Informasi terbaru dari alur kerja dan tenggat AKSARA." action={unread ? 'Tandai semua dibaca' : undefined} onAction={() => setUnread(0)} icon={CheckCheck} /><section className="surface-card notification-list">{notes.map(([title, desc, time, target], i) => <button onClick={() => { setUnread(0); navigate(target) }} key={title} className={unread && i < 3 ? 'unread' : ''}><span className="notification-icon"><Bell size={19} /></span><span><b>{title}</b><small>{desc}</small><em>{time}</em></span><ChevronRight size={18} /></button>)}</section></>
}


export default App
