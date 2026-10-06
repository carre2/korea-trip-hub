import fs from 'node:fs';
import path from 'node:path';
const root='C:/Users/user/Documents/Codex/korea-trip-hub';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,v)=>fs.writeFileSync(path.join(root,p),JSON.stringify(v,null,2)+'\n');
const date='2026-10-02';
const requirements='https://overseas.mofa.go.kr/ph-en/brd/m_3277/view.do?seq=738708&page=1';
const processing='https://overseas.mofa.go.kr/ph-en/brd/m_3275/view.do?seq=761029&page=1';
const agencies='https://overseas.mofa.go.kr/ph-en/brd/m_3275/view.do?seq=761028&page=1';
// Order: answer, submission, fee, processing, bank, employee, business,
// passport, form, checklist scope, collection, uncertainty, bank-statement scope,
// designated agencies, fee heading, processing heading, hub card.
const text={
en:[
'Filipino passport holders need a C-3-9 tourist visa for mainland Korea.',
'Submit through KVAC in the Philippines. Check the current KVAC instructions before visiting; the Embassy does not receive ordinary applications directly.',
'For Filipino applicants: stays of 59 days or less have no visa issuance fee; stays of 60–90 days cost PHP 2,000. KVAC charges are separate; an agency may add a service fee.',
'Effective 2026-10-01: ordinary C-3 processing is 12 working days; express applications remain 5 working days. Check express eligibility separately.',
'Bank certificate: issued in your name within the last 3 months, showing account name, number, type, opening date, current balance and 6-month average daily balance (ADB).',
'Employees: COE on company letterhead with position, salary, hired date, company address and HR phone/email, issued within the last 3 months; ITR (BIR Form 2316 or 1701).',
'Sole proprietors: DTI certificate, business/mayor’s permit and ITR (BIR Form 1701). Corporate applicants: SEC registration first page and GIS, mayor’s permit and ITR (BIR Form 1701 or 1702).',
'Original passport and copy of the passport bio-page.',
'Use the visa application form attached to the Embassy’s official tourist-visa requirements. Follow the form instructions.',
'This is a summary, not a complete checklist. Students, freelancers, retirees, sponsored applicants and other categories must use their own section of the official checklist.',
'Visit KVAC after receiving its SMS notice. Collect your passport and check the visa grant details.',
'Approval and entry are not guaranteed. Additional documents may be requested; the processing period may be recalculated after submission.',
'The current tourist checklist lists a bank certificate, rather than a separate bank-statement item for ordinary employees. This is not a blanket exemption from financial evidence: follow your category and any additional request.',
'If using an agency, choose from the Embassy’s current designated-agency list and confirm its submission arrangements.',
'Visa fees and separate service charges','Current processing notice','C-3-9 · KVAC · check fees and documents'
],
ko:[
'필리핀 여권 소지자가 한국 본토를 관광하려면 C-3-9 관광 비자가 필요합니다.',
'필리핀 KVAC를 통해 접수하세요. 방문 전 최신 KVAC 안내를 확인하세요. 일반 신청은 대사관에서 직접 접수하지 않습니다.',
'필리핀 국적 신청자: 59일 이하 체류는 사증 발급 수수료 면제, 60–90일 체류는 PHP 2,000입니다. KVAC 비용은 별도이며 대행기관 서비스 비용이 추가될 수 있습니다.',
'2026-10-01 시행: 일반 C-3 처리는 12영업일, 급행 신청은 5영업일입니다. 급행 자격은 별도로 확인하세요.',
'은행 잔고증명서: 최근 3개월 이내 신청자 명의로 발급받고, 계좌명·번호·유형·개설일·현재 잔액·6개월 평균잔액(ADB)을 포함해야 합니다.',
'직장인: 최근 3개월 이내 발급된 회사 공식 양식의 COE에 직위·급여·입사일·회사 주소·인사담당자 전화와 이메일을 포함하고, ITR(BIR Form 2316 또는 1701)을 준비하세요.',
'개인사업자: DTI 등록증, 사업/시장 허가증, ITR(BIR Form 1701). 법인 신청자: SEC 등록증 첫 페이지와 GIS, 시장 허가증, ITR(BIR Form 1701 또는 1702).',
'여권 원본과 여권 인적사항면 사본.',
'대사관 공식 관광 비자 구비서류 안내에 첨부된 신청서를 사용하고 신청서 지침을 따르세요.',
'완전한 체크리스트가 아닌 요약입니다. 학생·프리랜서·은퇴자·재정보증을 받는 신청자 등은 공식 체크리스트의 해당 항목을 확인해야 합니다.',
'KVAC 문자 안내를 받은 뒤 방문하세요. 여권을 수령하고 사증 발급 내역을 확인하세요.',
'비자 승인과 입국은 보장되지 않습니다. 추가 서류를 요구할 수 있으며 제출 후 심사 기간이 다시 계산될 수 있습니다.',
'최신 관광 비자 체크리스트의 일반 직장인 항목에는 별도 거래내역서 대신 잔고증명서가 명시돼 있습니다. 재정 증빙이 모두 면제되는 것은 아니므로 해당 신청 유형과 추가 요구를 따르세요.',
'대행기관 이용 시 대사관의 최신 지정기관 목록에서 선택하고 접수 방식을 확인하세요.',
'비자 수수료와 별도 서비스 비용','최신 처리 기간 공지','C-3-9 · KVAC · 수수료와 서류 확인'
],
ja:[
'フィリピンのパスポート所持者が韓国本土を観光するにはC-3-9観光ビザが必要です。',
'フィリピンのKVACを通じて申請します。訪問前に最新のKVAC案内を確認してください。通常の申請は大使館で直接受け付けていません。',
'フィリピン国籍の申請者：59日以下の滞在はビザ発給手数料免除、60–90日はPHP 2,000です。KVACの料金は別途必要で、代理店のサービス料が加わる場合もあります。',
'2026-10-01から、通常のC-3審査は12営業日、急行申請は5営業日です。急行申請の対象条件は別途確認してください。',
'銀行残高証明書：申請者名義で直近3か月以内に発行され、口座名義・番号・種類・開設日・現在の残高・6か月間の平均残高（ADB）が必要です。',
'会社員：直近3か月以内発行の会社レターヘッドによるCOEに役職・給与・入社日・会社住所・人事担当者の電話とメールを記載し、ITR（BIR Form 2316または1701）を準備します。',
'個人事業主：DTI登録証、事業／市長許可証、ITR（BIR Form 1701）。法人申請者：SEC登録の最初のページとGIS、市長許可証、ITR（BIR Form 1701または1702）。',
'パスポート原本と顔写真・個人情報ページのコピー。',
'大使館の公式観光ビザ必要書類に添付された申請書を使用し、その記入要領に従ってください。',
'これは要約であり、完全なチェックリストではありません。学生・フリーランス・退職者・支援を受ける申請者などは公式リストの該当区分を確認してください。',
'KVACからSMS通知を受け取ってから訪問してください。パスポートを受け取り、ビザ発給内容を確認します。',
'ビザ承認や入国は保証されません。追加書類を求められる場合があり、提出後に審査期間が再計算されることがあります。',
'最新の観光ビザチェックリストでは、通常の会社員について取引明細書の別項目ではなく銀行残高証明書が記載されています。資金証明の一律免除ではありません。該当区分と追加要求に従ってください。',
'代理店を利用する場合は大使館の最新指定代理店リストから選び、受付方法を確認してください。',
'ビザ手数料と別途サービス料','最新の審査期間のお知らせ','C-3-9 · KVAC · 手数料と書類を確認'
],
'zh-TW':[
'菲律賓護照持有人前往韓國本土觀光，須申請 C-3-9 觀光簽證。',
'透過菲律賓 KVAC 遞交申請。前往前請確認最新 KVAC 說明；一般申請不由大使館直接受理。',
'菲律賓籍申請人：停留 59 天以下免簽證核發費；停留 60–90 天為 PHP 2,000。KVAC 費用另計，代辦機構亦可能收取服務費。',
'自 2026-10-01 起，一般 C-3 審查為 12 個工作天，急件仍為 5 個工作天。急件資格須另外確認。',
'銀行存款證明：須於最近 3 個月內以申請人名義核發，載明帳戶名稱、號碼、類型、開戶日、目前餘額及 6 個月平均每日餘額（ADB）。',
'受僱者：最近 3 個月內核發的公司抬頭 COE，載明職位、薪資、到職日、公司地址與人資電話及電子郵件；另附 ITR（BIR Form 2316 或 1701）。',
'獨資業者：DTI 證明、營業／市長許可及 ITR（BIR Form 1701）。法人申請人：SEC 登記首頁與 GIS、市長許可及 ITR（BIR Form 1701 或 1702）。',
'護照正本及護照個人資料頁影本。',
'使用大使館官方觀光簽證文件說明所附的申請表，並依照表格指示填寫。',
'本頁僅為摘要，並非完整清單。學生、自由工作者、退休者、由他人提供財務支持的申請人等，請查看官方清單的對應類別。',
'收到 KVAC 的簡訊通知後再前往。領取護照並確認簽證核發資料。',
'不保證簽證核准或入境。審查時可能要求補件，提交後審查期間可能重新計算。',
'最新觀光簽證清單的普通受僱者項目列有存款證明，未另列銀行交易明細。這不代表全面免除財務證明；請依申請類別及補件要求準備。',
'使用代辦機構時，請從大使館最新指定名單選擇，並確認收件方式。',
'簽證費與另計的服務費','最新審查期間公告','C-3-9 · KVAC · 核對費用與文件'
],
zh:[
'菲律宾护照持有人前往韩国本土旅游，须申请 C-3-9 旅游签证。',
'通过菲律宾 KVAC 递交申请。前往前请确认最新 KVAC 说明；普通申请不由大使馆直接受理。',
'菲律宾籍申请人：停留 59 天以下免签证签发费；停留 60–90 天为 PHP 2,000。KVAC 费用另计，代办机构也可能收取服务费。',
'自 2026-10-01 起，普通 C-3 审查为 12 个工作日，加急仍为 5 个工作日。加急资格须另外确认。',
'银行存款证明：须于最近 3 个月内以申请人名义签发，载明账户名称、号码、类型、开户日、当前余额及 6 个月平均每日余额（ADB）。',
'受雇者：最近 3 个月内签发的公司抬头 COE，载明职位、薪资、入职日、公司地址与人事电话及电子邮箱；另附 ITR（BIR Form 2316 或 1701）。',
'独资业者：DTI 证明、营业／市长许可及 ITR（BIR Form 1701）。法人申请人：SEC 登记首页与 GIS、市长许可及 ITR（BIR Form 1701 或 1702）。',
'护照原件及护照个人资料页复印件。',
'使用大使馆官方旅游签证文件说明所附的申请表，并按照表格指示填写。',
'本页仅为摘要，并非完整清单。学生、自由职业者、退休者、由他人提供财务支持的申请人等，请查看官方清单的对应类别。',
'收到 KVAC 的短信通知后再前往。领取护照并确认签证签发资料。',
'不保证签证批准或入境。审查时可能要求补件，提交后审查期间可能重新计算。',
'最新旅游签证清单的普通受雇者项目列有存款证明，未另列银行交易明细。这不代表全面免除财务证明；请依申请类别及补件要求准备。',
'使用代办机构时，请从大使馆最新指定名单选择，并确认收件方式。',
'签证费与另计的服务费','最新审查期间公告','C-3-9 · KVAC · 核对费用与文件'
],
vi:[
'Người mang hộ chiếu Philippines cần thị thực du lịch C-3-9 để đến phần đất liền Hàn Quốc.',
'Nộp hồ sơ qua KVAC tại Philippines. Kiểm tra hướng dẫn KVAC mới nhất trước khi đến; Đại sứ quán không trực tiếp nhận hồ sơ thông thường.',
'Với người quốc tịch Philippines: lưu trú từ 59 ngày trở xuống được miễn phí cấp thị thực; từ 60–90 ngày là PHP 2,000. Phí KVAC tính riêng; đại lý có thể thu thêm phí dịch vụ.',
'Từ 2026-10-01: xử lý C-3 thông thường mất 12 ngày làm việc; hồ sơ nhanh vẫn là 5 ngày làm việc. Kiểm tra riêng điều kiện dùng dịch vụ nhanh.',
'Giấy xác nhận ngân hàng: cấp trong 3 tháng gần nhất, đứng tên người nộp, có tên, số, loại tài khoản, ngày mở, số dư hiện tại và số dư trung bình hằng ngày trong 6 tháng (ADB).',
'Người làm công: COE trên giấy tiêu đề công ty, cấp trong 3 tháng gần nhất, có chức vụ, lương, ngày vào làm, địa chỉ công ty, điện thoại/email nhân sự; kèm ITR (BIR Form 2316 hoặc 1701).',
'Chủ hộ kinh doanh: chứng nhận DTI, giấy phép kinh doanh/thị trưởng và ITR (BIR Form 1701). Doanh nghiệp: trang đầu đăng ký SEC và GIS, giấy phép thị trưởng, ITR (BIR Form 1701 hoặc 1702).',
'Hộ chiếu gốc và bản sao trang thông tin cá nhân.',
'Dùng mẫu đơn đính kèm hướng dẫn thị thực du lịch chính thức của Đại sứ quán và làm theo chỉ dẫn trên mẫu.',
'Đây là bản tóm tắt, không phải danh sách đầy đủ. Sinh viên, người làm tự do, người nghỉ hưu, người được tài trợ và các nhóm khác phải xem mục riêng trong danh sách chính thức.',
'Đến KVAC sau khi nhận thông báo SMS. Nhận hộ chiếu và kiểm tra thông tin cấp thị thực.',
'Không bảo đảm được cấp thị thực hay nhập cảnh. Có thể cần bổ sung giấy tờ; thời gian xét duyệt có thể được tính lại sau khi nộp.',
'Danh sách du lịch hiện hành yêu cầu giấy xác nhận ngân hàng cho người làm công thông thường, không liệt kê sao kê thành mục riêng. Điều này không miễn toàn bộ chứng minh tài chính: làm theo nhóm hồ sơ và yêu cầu bổ sung.',
'Nếu dùng đại lý, chọn trong danh sách được Đại sứ quán chỉ định hiện hành và xác nhận cách nộp.',
'Phí thị thực và phí dịch vụ riêng','Thông báo thời gian xét duyệt mới nhất','C-3-9 · KVAC · kiểm tra phí và giấy tờ'
],
id:[
'Pemegang paspor Filipina memerlukan visa wisata C-3-9 untuk mengunjungi daratan Korea.',
'Ajukan melalui KVAC di Filipina. Periksa petunjuk KVAC terbaru sebelum datang; Kedutaan tidak menerima pengajuan biasa secara langsung.',
'Untuk warga Filipina: masa tinggal 59 hari atau kurang bebas biaya penerbitan visa; 60–90 hari dikenai PHP 2,000. Biaya KVAC terpisah; agen dapat menambah biaya layanan.',
'Mulai 2026-10-01: proses C-3 biasa memerlukan 12 hari kerja; pengajuan ekspres tetap 5 hari kerja. Periksa kelayakan ekspres secara terpisah.',
'Surat bank: diterbitkan atas nama pemohon dalam 3 bulan terakhir, mencantumkan nama, nomor, jenis rekening, tanggal pembukaan, saldo saat ini dan saldo harian rata-rata 6 bulan (ADB).',
'Karyawan: COE berkepala surat perusahaan, diterbitkan dalam 3 bulan terakhir, berisi jabatan, gaji, tanggal masuk, alamat perusahaan dan telepon/email HR; serta ITR (BIR Form 2316 atau 1701).',
'Usaha perseorangan: sertifikat DTI, izin usaha/wali kota dan ITR (BIR Form 1701). Pemohon perusahaan: halaman pertama pendaftaran SEC dan GIS, izin wali kota, ITR (BIR Form 1701 atau 1702).',
'Paspor asli dan salinan halaman biodata paspor.',
'Gunakan formulir yang dilampirkan pada persyaratan visa wisata resmi Kedutaan dan ikuti petunjuk formulir.',
'Ini ringkasan, bukan daftar lengkap. Pelajar, pekerja lepas, pensiunan, pemohon bersponsor dan kategori lain harus mengikuti bagian masing-masing dalam daftar resmi.',
'Datang ke KVAC setelah menerima pemberitahuan SMS. Ambil paspor dan periksa rincian penerbitan visa.',
'Persetujuan visa dan izin masuk tidak dijamin. Dokumen tambahan dapat diminta; masa pemeriksaan dapat dihitung ulang setelah penyerahan.',
'Daftar wisata terbaru mencantumkan surat bank untuk karyawan biasa, bukan rekening koran sebagai item terpisah. Ini bukan pembebasan menyeluruh atas bukti keuangan: ikuti kategori dan permintaan tambahan.',
'Jika memakai agen, pilih dari daftar agen resmi Kedutaan terbaru dan pastikan prosedur penyerahannya.',
'Biaya visa dan biaya layanan terpisah','Pengumuman waktu proses terbaru','C-3-9 · KVAC · periksa biaya dan dokumen'
],
ms:[
'Pemegang pasport Filipina memerlukan visa pelancong C-3-9 untuk melawat tanah besar Korea.',
'Hantar melalui KVAC di Filipina. Semak arahan KVAC terkini sebelum hadir; Kedutaan tidak menerima permohonan biasa secara langsung.',
'Bagi warga Filipina: penginapan 59 hari atau kurang dikecualikan fi pengeluaran visa; 60–90 hari dikenakan PHP 2,000. Caj KVAC berasingan; agensi mungkin mengenakan fi perkhidmatan.',
'Mulai 2026-10-01: pemprosesan C-3 biasa ialah 12 hari bekerja; permohonan ekspres kekal 5 hari bekerja. Semak kelayakan ekspres secara berasingan.',
'Sijil bank: dikeluarkan atas nama pemohon dalam 3 bulan terkini, dengan nama, nombor, jenis akaun, tarikh pembukaan, baki semasa dan purata baki harian 6 bulan (ADB).',
'Pekerja: COE pada kepala surat syarikat, dikeluarkan dalam 3 bulan terkini, menyatakan jawatan, gaji, tarikh mula bekerja, alamat syarikat dan telefon/e-mel HR; serta ITR (BIR Form 2316 atau 1701).',
'Pemilik tunggal: sijil DTI, permit perniagaan/datuk bandar dan ITR (BIR Form 1701). Pemohon korporat: halaman pertama pendaftaran SEC dan GIS, permit datuk bandar, ITR (BIR Form 1701 atau 1702).',
'Pasport asal dan salinan halaman biodata pasport.',
'Gunakan borang yang dilampirkan pada keperluan visa pelancong rasmi Kedutaan dan ikuti arahan borang.',
'Ini ringkasan, bukan senarai lengkap. Pelajar, pekerja bebas, pesara, pemohon yang ditaja dan kategori lain perlu merujuk bahagian masing-masing dalam senarai rasmi.',
'Hadir ke KVAC selepas menerima notis SMS. Ambil pasport dan semak butiran pengeluaran visa.',
'Kelulusan visa dan kemasukan tidak dijamin. Dokumen tambahan boleh diminta; tempoh semakan boleh dikira semula selepas penyerahan.',
'Senarai pelancong terkini menyenaraikan sijil bank bagi pekerja biasa, bukan penyata bank sebagai item berasingan. Ini bukan pengecualian menyeluruh bukti kewangan: ikut kategori dan permintaan tambahan.',
'Jika menggunakan agensi, pilih daripada senarai agensi dilantik Kedutaan terkini dan sahkan kaedah penghantaran.',
'Fi visa dan caj perkhidmatan berasingan','Notis tempoh pemprosesan terkini','C-3-9 · KVAC · semak fi dan dokumen'
],
th:[
'ผู้ถือหนังสือเดินทางฟิลิปปินส์ต้องมีวีซ่าท่องเที่ยว C-3-9 เพื่อเดินทางไปเกาหลีแผ่นดินใหญ่',
'ยื่นผ่าน KVAC ในฟิลิปปินส์ ตรวจสอบคำแนะนำล่าสุดของ KVAC ก่อนเดินทางไป สถานทูตไม่รับคำขอทั่วไปโดยตรง',
'สำหรับผู้สมัครสัญชาติฟิลิปปินส์: พำนักไม่เกิน 59 วันยกเว้นค่าธรรมเนียมออกวีซ่า; 60–90 วันมีค่าธรรมเนียม PHP 2,000 ค่าบริการ KVAC แยกต่างหาก และตัวแทนอาจเรียกเก็บค่าบริการเพิ่ม',
'ตั้งแต่ 2026-10-01: การพิจารณา C-3 ทั่วไปใช้ 12 วันทำการ ส่วนคำขอเร่งด่วนยังใช้ 5 วันทำการ ตรวจสอบคุณสมบัติการยื่นเร่งด่วนแยกต่างหาก',
'หนังสือรับรองธนาคาร: ออกในชื่อผู้สมัครภายใน 3 เดือนล่าสุด ระบุชื่อ เลขที่ ประเภทบัญชี วันที่เปิดบัญชี ยอดปัจจุบัน และยอดเฉลี่ยรายวันย้อนหลัง 6 เดือน (ADB)',
'พนักงาน: COE บนหัวกระดาษบริษัท ออกภายใน 3 เดือนล่าสุด ระบุตำแหน่ง เงินเดือน วันเริ่มงาน ที่อยู่บริษัท โทรศัพท์และอีเมลฝ่ายบุคคล พร้อม ITR (BIR Form 2316 หรือ 1701)',
'เจ้าของกิจการคนเดียว: ใบรับรอง DTI ใบอนุญาตธุรกิจ/นายกเทศมนตรี และ ITR (BIR Form 1701) ผู้สมัครนิติบุคคล: หน้าแรกทะเบียน SEC และ GIS ใบอนุญาตนายกเทศมนตรี และ ITR (BIR Form 1701 หรือ 1702)',
'หนังสือเดินทางฉบับจริงและสำเนาหน้าข้อมูลส่วนบุคคล',
'ใช้แบบฟอร์มที่แนบกับข้อกำหนดวีซ่าท่องเที่ยวอย่างเป็นทางการของสถานทูต และปฏิบัติตามคำแนะนำในแบบฟอร์ม',
'นี่เป็นสรุป ไม่ใช่รายการครบถ้วน นักเรียน ผู้ทำงานอิสระ ผู้เกษียณ ผู้สมัครที่มีผู้สนับสนุน และกลุ่มอื่นต้องดูหมวดของตนในรายการทางการ',
'ไป KVAC หลังได้รับแจ้งทาง SMS รับหนังสือเดินทางและตรวจสอบรายละเอียดการออกวีซ่า',
'ไม่รับประกันการอนุมัติวีซ่าหรือการเข้าประเทศ อาจมีการขอเอกสารเพิ่มเติมและคำนวณระยะเวลาพิจารณาใหม่หลังยื่น',
'รายการท่องเที่ยวล่าสุดระบุหนังสือรับรองธนาคารสำหรับพนักงานทั่วไป โดยไม่ได้แยกรายการเดินบัญชีต่างหาก ไม่ใช่การยกเว้นหลักฐานการเงินทั้งหมด ต้องทำตามหมวดผู้สมัครและคำขอเพิ่มเติม',
'หากใช้ตัวแทน ให้เลือกจากรายชื่อตัวแทนที่สถานทูตแต่งตั้งล่าสุดและยืนยันวิธีส่งเอกสาร',
'ค่าธรรมเนียมวีซ่าและค่าบริการแยกต่างหาก','ประกาศระยะเวลาพิจารณาล่าสุด','C-3-9 · KVAC · ตรวจสอบค่าธรรมเนียมและเอกสาร'
],
es:[
'Los titulares de pasaporte filipino necesitan un visado turístico C-3-9 para Corea continental.',
'Presenta la solicitud a través de KVAC en Filipinas. Revisa sus instrucciones actuales antes de acudir; la Embajada no recibe solicitudes ordinarias directamente.',
'Para ciudadanos filipinos: estancias de hasta 59 días sin tasa de expedición; estancias de 60–90 días cuestan PHP 2,000. Los cargos de KVAC son aparte; una agencia puede añadir honorarios.',
'Desde 2026-10-01: el trámite C-3 ordinario tarda 12 días laborables; el exprés sigue en 5 días laborables. Comprueba por separado los requisitos del exprés.',
'Certificado bancario: expedido a nombre del solicitante en los últimos 3 meses, con nombre, número, tipo de cuenta, fecha de apertura, saldo actual y saldo medio diario de 6 meses (ADB).',
'Empleados: COE en papel membretado, expedido en los últimos 3 meses, con puesto, salario, fecha de contratación, dirección y teléfono/correo de RR. HH.; e ITR (BIR Form 2316 o 1701).',
'Empresarios individuales: certificado DTI, permiso comercial/del alcalde e ITR (BIR Form 1701). Empresas: primera página del registro SEC y GIS, permiso del alcalde e ITR (BIR Form 1701 o 1702).',
'Pasaporte original y copia de su página de datos personales.',
'Usa el formulario adjunto a los requisitos oficiales de visado turístico de la Embajada y sigue sus instrucciones.',
'Es un resumen, no una lista completa. Estudiantes, autónomos, jubilados, solicitantes con patrocinador y otras categorías deben consultar su sección de la lista oficial.',
'Acude a KVAC tras recibir su aviso por SMS. Recoge el pasaporte y comprueba los datos de concesión del visado.',
'No se garantiza la aprobación ni la entrada. Pueden solicitar documentos adicionales y recalcular el plazo tras su entrega.',
'La lista turística actual exige un certificado bancario para empleados ordinarios, sin enumerar un extracto como documento separado. No es una exención general de pruebas económicas: sigue tu categoría y cualquier petición adicional.',
'Si recurres a una agencia, elige de la lista vigente de agencias designadas por la Embajada y confirma cómo presentar la solicitud.',
'Tasas de visado y cargos de servicio aparte','Aviso actual de plazos','C-3-9 · KVAC · revisa tasas y documentos'
],
fr:[
'Les titulaires d’un passeport philippin ont besoin d’un visa touristique C-3-9 pour la Corée continentale.',
'Déposez le dossier via KVAC aux Philippines. Consultez ses instructions actuelles avant de venir ; l’ambassade ne reçoit pas directement les demandes ordinaires.',
'Pour les citoyens philippins : séjour de 59 jours ou moins sans frais de délivrance ; séjour de 60–90 jours à PHP 2,000. Les frais KVAC sont distincts ; une agence peut ajouter ses honoraires.',
'Depuis le 2026-10-01 : le traitement C-3 ordinaire est de 12 jours ouvrés ; les demandes express restent à 5 jours ouvrés. Vérifiez séparément les conditions de l’express.',
'Attestation bancaire : délivrée au nom du demandeur dans les 3 derniers mois, avec nom, numéro et type de compte, date d’ouverture, solde actuel et solde quotidien moyen sur 6 mois (ADB).',
'Salariés : COE sur papier à en-tête, délivré dans les 3 derniers mois, avec poste, salaire, date d’embauche, adresse et téléphone/courriel RH ; et ITR (BIR Form 2316 ou 1701).',
'Entrepreneurs individuels : certificat DTI, permis commercial/du maire et ITR (BIR Form 1701). Sociétés : première page du registre SEC et GIS, permis du maire et ITR (BIR Form 1701 ou 1702).',
'Passeport original et copie de la page de données personnelles.',
'Utilisez le formulaire joint aux exigences officielles de visa touristique de l’ambassade et suivez ses instructions.',
'Ceci est un résumé, pas une liste complète. Étudiants, indépendants, retraités, demandeurs parrainés et autres catégories doivent consulter leur section de la liste officielle.',
'Rendez-vous à KVAC après réception du SMS. Récupérez votre passeport et vérifiez les informations de délivrance du visa.',
'Ni l’approbation ni l’entrée ne sont garanties. Des pièces supplémentaires peuvent être demandées et le délai recalculé après leur dépôt.',
'La liste touristique actuelle mentionne une attestation bancaire pour les salariés ordinaires, sans relevé bancaire comme pièce distincte. Il ne s’agit pas d’une dispense générale de justificatifs financiers : suivez votre catégorie et les demandes complémentaires.',
'Si vous passez par une agence, choisissez dans la liste actuelle de l’ambassade et confirmez les modalités de dépôt.',
'Frais de visa et services facturés séparément','Avis actuel sur les délais','C-3-9 · KVAC · vérifiez frais et documents'
],
ru:[
'Владельцам филиппинских паспортов для туризма в материковой Корее нужна виза C-3-9.',
'Подавайте через KVAC на Филиппинах. Перед посещением проверьте актуальные инструкции KVAC; посольство не принимает обычные заявления напрямую.',
'Для граждан Филиппин: пребывание до 59 дней включительно без сбора за выдачу визы; 60–90 дней — PHP 2,000. Сборы KVAC оплачиваются отдельно; агентство может добавить плату за услуги.',
'С 2026-10-01: обычное рассмотрение C-3 занимает 12 рабочих дней, экспресс — по-прежнему 5 рабочих дней. Условия экспресс-подачи проверяйте отдельно.',
'Банковская справка: выдана на имя заявителя за последние 3 месяца, содержит имя владельца, номер, тип и дату открытия счета, текущий остаток и средний ежедневный остаток за 6 месяцев (ADB).',
'Работники: COE на бланке компании, выданная за последние 3 месяца, с должностью, зарплатой, датой найма, адресом компании и телефоном/email отдела кадров; ITR (BIR Form 2316 или 1701).',
'Индивидуальные предприниматели: сертификат DTI, разрешение на бизнес/мэра, ITR (BIR Form 1701). Компании: первая страница регистрации SEC и GIS, разрешение мэра, ITR (BIR Form 1701 или 1702).',
'Оригинал паспорта и копия страницы персональных данных.',
'Используйте анкету, приложенную к официальным требованиям посольства для туристической визы, и следуйте ее инструкциям.',
'Это краткое изложение, а не полный список. Студентам, фрилансерам, пенсионерам, заявителям со спонсором и другим категориям нужен соответствующий раздел официального списка.',
'Приходите в KVAC после получения SMS. Заберите паспорт и проверьте данные выданной визы.',
'Одобрение визы и въезд не гарантированы. Могут запросить дополнительные документы и пересчитать срок рассмотрения после их подачи.',
'Текущий туристический список для обычных работников содержит банковскую справку, а не выписку отдельным пунктом. Это не всеобщая отмена финансовых доказательств: следуйте своей категории и дополнительным запросам.',
'При обращении в агентство выбирайте из текущего списка назначенных посольством агентств и уточняйте порядок подачи.',
'Визовый сбор и отдельная плата за услуги','Актуальное уведомление о сроках','C-3-9 · KVAC · проверьте сборы и документы'
]
};
const backup='G:/내 드라이브/korea-trip-hub/marketing/2026-10-02/visa-backup';
fs.mkdirSync(backup,{recursive:true});
for(const p of ['data/facts.json','data/visa/philippines.json','data/visa/philippines.i18n.json','data/guides/visa.json','data/guides/visa.i18n.json','public/visa-faq.json']) {const dest=path.join(backup,p.replaceAll('/','__'));if(!fs.existsSync(dest))fs.copyFileSync(path.join(root,p),dest);}
const base=JSON.parse(fs.readFileSync(path.join(backup,'data__visa__philippines.json'),'utf8')), old=JSON.parse(fs.readFileSync(path.join(backup,'data__visa__philippines.i18n.json'),'utf8'));
const keys=['visa_fee','processing','apply_at'];
const values=[text.en[2],text.en[3],text.en[1]];
function guide(loc){
 const t=text[loc], o=loc==='en'?base:old[loc];
 const rows=o.documents.rows;
 return {
 ...(loc==='en'?{_README:'Official Embassy checklist and processing notice, reviewed 2026-10-02. See facts SSOT.',country:base.country,flag:base.flag,code:base.code,factId:base.factId,hero:base.hero}:{}),
 kicker:o.kicker,readingTime:'',...(o.h1?{h1:o.h1}:{}),metaTitle:o.metaTitle,metaDesc:t[0]+' '+t[1],updated:date,
 ...(o.ui?{ui:o.ui}:{}),
 verdict:{need:true,headline:t[0],sub:t[1],type:'C-3-9',stay:'',entry:''},
 highlights:[{icon:'🧾',tone:'green',title:t[14],body:t[2]},{icon:'🗓️',tone:'blue',title:t[15],body:t[3]}],
 tldr:[t[0],t[2],t[3],t[12]],
 steps:{title:o.steps.title,items:[
 {n:1,title:o.steps.items[2].title,detail:t[9],link:requirements,linkLabel:o.ui?.official||'Official requirements'},
 {n:2,title:'KVAC',detail:t[1]+' '+t[13],link:agencies,linkLabel:o.ui?.official||'Official agencies'},
 {n:3,title:t[15],detail:t[3]+' '+t[11],link:processing,linkLabel:o.ui?.official||'Official processing notice'},
 {n:4,title:o.steps.items[6].title,detail:t[10]}]},
 documents:{title:o.documents.title,intro:t[9],cols:o.documents.cols,legend:o.documents.legend,rows:[
 {...rows[0],how:t[7]},
 {...rows[1],where:o.ui?.official||'Official source',how:t[8],link:requirements},
 {...rows[2]},
 {...rows[3],req:'conditional',how:t[4]},
 {...rows[5],doc:rows[5].doc+' / ITR',req:'conditional',how:t[5]},
 {...rows[6],req:'conditional',how:t[6]}
 ]},
 faq:{title:o.faq.title,items:[
 {...o.faq.items[0],a:t[0]}, {...o.faq.items[1],a:t[2]},
 {...o.faq.items[2],a:t[12]+' '+t[4]}, {...o.faq.items[3],a:t[3]+' '+t[11]},
 {...o.faq.items[4],a:t[1]+' '+t[13]}
 ]},
 resources:{title:o.ui?.official||'Official sources',intro:t[9],items:[
 {label:o.documents.title,src:'overseas.mofa.go.kr',url:requirements},
 {label:t[15],src:'overseas.mofa.go.kr',url:processing},
 {label:'KVAC',src:'visaforkorea-mn.com',url:'https://www.visaforkorea-mn.com'}]},
 official:[{icon:'🏛️',name:o.ui?.official||'Embassy of the Republic of Korea in the Philippines',url:requirements,what:o.documents.title},{icon:'🗓️',name:t[15],url:processing,what:t[3]}],
 factLabels:{visa_fee:t[14],processing:t[15],apply_at:o.faq.items[4].q},
 factValueLabels:Object.fromEntries(values.map((v,i)=>[v,[t[2],t[3],t[1]][i]]))
 };
}
const revised=guide('en');
write('data/visa/philippines.json',revised);
write('data/visa/philippines.i18n.json',Object.fromEntries([['_README','Reviewed against official sources on 2026-10-02; native-language review recommended.'],...Object.keys(old).filter(k=>!k.startsWith('_')).map(loc=>[loc,guide(loc)])]));
const facts=read('data/facts.json'), f=facts.facts.find(f=>f.id===base.factId);
Object.assign(f,{claim:text.en[0]+' '+text.en[2]+' '+text.en[3],value:Object.fromEntries(keys.map((k,i)=>[k,values[i]])),source:requirements,source_name:'Embassy of the Republic of Korea in the Philippines — tourist checklist',verified:date,recheck_after:'2026-11-01',status:'VERIFIED',notes:text.en[9]+' '+text.en[11],sources:[requirements,processing,agencies],document_requirements:{passport:text.en[7],form:text.en[8],bank_certificate:text.en[4],employment:text.en[5],business:text.en[6],bank_statement_scope:text.en[12],collection:text.en[10],photo:'3.5 cm × 4.5 cm; plain white background, taken within the last 6 months; no copies, selfies or altered photos.'}});
facts._updated=date;write('data/facts.json',facts);
for(const [loc,t] of Object.entries(text)){
 const p=`messages/${loc}.json`,m=read(p);
 if(!fs.existsSync(path.join(backup,`messages__${loc}.json`)))fs.copyFileSync(path.join(root,p),path.join(backup,`messages__${loc}.json`));
 m.facts ||= {};m.facts[base.factId]={claim:t[0]+' '+t[2]+' '+t[3],notes:t[9]+' '+t[11]};write(p,m);
}
const hub=read('data/guides/visa.json');
hub.countryGuides.items.find(x=>x.code==='philippines').note=text.en[16];write('data/guides/visa.json',hub);
const hi=read('data/guides/visa.i18n.json');
for(const [loc,o] of Object.entries(hi)) if(text[loc]&&o.countryGuides?.items){const item=o.countryGuides.items.find(x=>x.code==='philippines');if(item)item.note=text[loc][16];}
write('data/guides/visa.i18n.json',hi);
console.log('Updated official facts, 12 locale guides/messages and visa hub cards.');
