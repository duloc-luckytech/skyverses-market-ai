import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Eye, Server, UserCheck, Bell, Globe, Mail,
  ChevronRight, ArrowUp, ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/* ─────────────────────── i18n content ─────────────────────── */

interface PrivacyContent {
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  last_updated: string;
  toc_title: string;
  back_home: string;
}

const content: Record<string, PrivacyContent> = {
  en: {
    hero_badge: 'Privacy First',
    hero_title: 'Privacy Policy',
    hero_subtitle:
      'We respect your privacy and are committed to protecting your personal data. This policy explains the types of information we collect and how we use it.',
    last_updated: 'Last updated: April 12, 2026',
    toc_title: 'Contents',
    back_home: 'Back to Insights',
  },
  vi: {
    hero_badge: 'Ưu tiên Quyền riêng tư',
    hero_title: 'Chính sách Bảo mật',
    hero_subtitle:
      'Chúng tôi tôn trọng quyền riêng tư của bạn và cam kết bảo vệ dữ liệu cá nhân của bạn. Chính sách này giải thích các loại thông tin chúng tôi thu thập và cách chúng tôi sử dụng chúng.',
    last_updated: 'Cập nhật lần cuối: 12/04/2026',
    toc_title: 'Nội dung',
    back_home: 'Quay lại Insights',
  },
  ko: {
    hero_badge: '개인정보 우선',
    hero_title: '개인정보 처리방침',
    hero_subtitle:
      '당사는 귀하의 개인정보를 존중하며 개인 데이터를 보호하기 위해 최선을 다하고 있습니다. 이 정책은 당사가 수집하는 정보의 종류와 사용 방법을 설명합니다.',
    last_updated: '마지막 업데이트: 2026년 4월 12일',
    toc_title: '목차',
    back_home: 'Insights로 돌아가기',
  },
  ja: {
    hero_badge: 'プライバシーファースト',
    hero_title: 'プライバシーポリシー',
    hero_subtitle:
      '当社はお客様のプライバシーを尊重し、個人データの保護に取り組んでいます。このポリシーでは、当社が収集する情報の種類とその使用方法について説明します。',
    last_updated: '最終更新日: 2026年4月12日',
    toc_title: '目次',
    back_home: 'Insightsに戻る',
  },
};

/* ─────────────────────── Section data ─────────────────────── */

interface Section {
  id: string;
  icon: React.ReactNode;
  title: Record<string, string>;
  body: Record<string, React.ReactNode>;
}

const SECTIONS: Section[] = [
  {
    id: 'information-we-collect',
    icon: <Eye size={18} />,
    title: {
      en: 'Information We Collect',
      vi: 'Thông tin Chúng tôi Thu thập',
      ko: '수집하는 정보',
      ja: '収集する情報',
    },
    body: {
      en: (
        <>
          <p>We collect information to provide better services to all our users. The types of information we collect include:</p>
          <ul>
            <li><strong>Account information:</strong> When you register for Skyverses AI, we collect your name, email address, and profile picture via Google OAuth.</li>
            <li><strong>Usage data:</strong> We collect information about how you interact with our services, including AI generation history, feature usage patterns, and session activity.</li>
            <li><strong>Device &amp; technical data:</strong> Browser type, operating system, IP address, language preference, and time zone.</li>
            <li><strong>Payment information:</strong> For credit top-ups, bank transfer references are logged. We do not store card numbers or payment credentials directly.</li>
            <li><strong>User content:</strong> Prompts, uploaded images, and generated media created through the platform.</li>
          </ul>
        </>
      ),
      vi: (
        <>
          <p>Chúng tôi thu thập thông tin để cung cấp dịch vụ tốt hơn cho tất cả người dùng. Các loại thông tin chúng tôi thu thập bao gồm:</p>
          <ul>
            <li><strong>Thông tin tài khoản:</strong> Khi bạn đăng ký Skyverses AI, chúng tôi thu thập tên, địa chỉ email và ảnh đại diện qua Google OAuth.</li>
            <li><strong>Dữ liệu sử dụng:</strong> Chúng tôi thu thập thông tin về cách bạn tương tác với dịch vụ, bao gồm lịch sử tạo AI, mẫu sử dụng tính năng và hoạt động phiên.</li>
            <li><strong>Dữ liệu thiết bị &amp; kỹ thuật:</strong> Loại trình duyệt, hệ điều hành, địa chỉ IP, tùy chọn ngôn ngữ và múi giờ.</li>
            <li><strong>Thông tin thanh toán:</strong> Đối với nạp credit, tham chiếu chuyển khoản ngân hàng được ghi lại. Chúng tôi không lưu trữ số thẻ hoặc thông tin thanh toán trực tiếp.</li>
            <li><strong>Nội dung người dùng:</strong> Prompt, hình ảnh tải lên và media được tạo qua nền tảng.</li>
          </ul>
        </>
      ),
      ko: (
        <>
          <p>당사는 모든 사용자에게 더 나은 서비스를 제공하기 위해 정보를 수집합니다. 수집하는 정보의 종류는 다음과 같습니다:</p>
          <ul>
            <li><strong>계정 정보:</strong> Skyverses AI에 등록할 때 Google OAuth를 통해 이름, 이메일 주소, 프로필 사진을 수집합니다.</li>
            <li><strong>사용 데이터:</strong> AI 생성 기록, 기능 사용 패턴, 세션 활동을 포함하여 서비스와 상호작용하는 방식에 대한 정보를 수집합니다.</li>
            <li><strong>기기 &amp; 기술 데이터:</strong> 브라우저 유형, 운영체제, IP 주소, 언어 환경 설정 및 시간대.</li>
            <li><strong>결제 정보:</strong> 크레딧 충전 시 계좌이체 참조번호가 기록됩니다. 카드 번호나 결제 자격 증명은 직접 저장하지 않습니다.</li>
            <li><strong>사용자 콘텐츠:</strong> 플랫폼을 통해 생성된 프롬프트, 업로드된 이미지 및 생성된 미디어.</li>
          </ul>
        </>
      ),
      ja: (
        <>
          <p>当社はすべてのユーザーにより良いサービスを提供するために情報を収集します。収集する情報の種類には以下が含まれます:</p>
          <ul>
            <li><strong>アカウント情報:</strong> Skyverses AIに登録する際、Google OAuthを通じてお名前、メールアドレス、プロフィール画像を収集します。</li>
            <li><strong>使用データ:</strong> AI生成履歴、機能使用パターン、セッションアクティビティを含む、サービスとのインタラクションに関する情報を収集します。</li>
            <li><strong>デバイス・技術データ:</strong> ブラウザの種類、オペレーティングシステム、IPアドレス、言語設定、タイムゾーン。</li>
            <li><strong>支払い情報:</strong> クレジットチャージの際、銀行振込の参照番号が記録されます。カード番号や支払い認証情報は直接保存しません。</li>
            <li><strong>ユーザーコンテンツ:</strong> プラットフォームを通じて作成されたプロンプト、アップロードされた画像、生成されたメディア。</li>
          </ul>
        </>
      ),
    },
  },
  {
    id: 'how-we-use',
    icon: <UserCheck size={18} />,
    title: {
      en: 'How We Use Your Information',
      vi: 'Chúng tôi Sử dụng Thông tin như thế nào',
      ko: '정보 사용 방법',
      ja: '情報の使用方法',
    },
    body: {
      en: (
        <>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our AI services</li>
            <li>Process credit transactions and manage your account balance</li>
            <li>Send service notifications, updates, and security alerts</li>
            <li>Personalize your experience and surface relevant AI tools</li>
            <li>Analyze usage trends to improve platform performance</li>
            <li>Prevent fraud, abuse, and enforce our Terms of Service</li>
            <li>Comply with legal obligations and resolve disputes</li>
          </ul>
          <p>We do <strong>not</strong> sell your personal data to third parties for advertising purposes.</p>
        </>
      ),
      vi: (
        <>
          <p>Chúng tôi sử dụng thông tin thu thập được để:</p>
          <ul>
            <li>Cung cấp, duy trì và cải thiện dịch vụ AI của chúng tôi</li>
            <li>Xử lý giao dịch credit và quản lý số dư tài khoản của bạn</li>
            <li>Gửi thông báo dịch vụ, cập nhật và cảnh báo bảo mật</li>
            <li>Cá nhân hóa trải nghiệm và hiển thị các công cụ AI phù hợp</li>
            <li>Phân tích xu hướng sử dụng để cải thiện hiệu suất nền tảng</li>
            <li>Ngăn chặn gian lận, lạm dụng và thực thi Điều khoản Dịch vụ</li>
            <li>Tuân thủ các nghĩa vụ pháp lý và giải quyết tranh chấp</li>
          </ul>
          <p>Chúng tôi <strong>không</strong> bán dữ liệu cá nhân của bạn cho bên thứ ba vì mục đích quảng cáo.</p>
        </>
      ),
      ko: (
        <>
          <p>수집한 정보를 다음과 같은 목적으로 사용합니다:</p>
          <ul>
            <li>AI 서비스 제공, 유지 및 개선</li>
            <li>크레딧 거래 처리 및 계정 잔액 관리</li>
            <li>서비스 알림, 업데이트 및 보안 경고 전송</li>
            <li>경험 개인화 및 관련 AI 도구 제공</li>
            <li>플랫폼 성능 개선을 위한 사용 추세 분석</li>
            <li>사기 및 악용 방지, 서비스 이용약관 집행</li>
            <li>법적 의무 준수 및 분쟁 해결</li>
          </ul>
          <p>당사는 광고 목적으로 귀하의 개인 데이터를 제3자에게 <strong>판매하지 않습니다</strong>.</p>
        </>
      ),
      ja: (
        <>
          <p>収集した情報を以下の目的で使用します:</p>
          <ul>
            <li>AIサービスの提供、維持、改善</li>
            <li>クレジット取引の処理とアカウント残高の管理</li>
            <li>サービス通知、アップデート、セキュリティアラートの送信</li>
            <li>体験のパーソナライズと関連AIツールの提供</li>
            <li>プラットフォームパフォーマンス向上のための使用傾向分析</li>
            <li>詐欺・不正使用の防止、利用規約の執行</li>
            <li>法的義務の遵守と紛争解決</li>
          </ul>
          <p>広告目的でお客様の個人データを第三者に<strong>販売することはありません</strong>。</p>
        </>
      ),
    },
  },
  {
    id: 'data-sharing',
    icon: <Globe size={18} />,
    title: {
      en: 'Data Sharing & Third Parties',
      vi: 'Chia sẻ Dữ liệu & Bên thứ ba',
      ko: '데이터 공유 및 제3자',
      ja: 'データ共有と第三者',
    },
    body: {
      en: (
        <>
          <p>We may share your information with:</p>
          <ul>
            <li><strong>AI service providers:</strong> Google (Gemini), OpenAI, RunningHub, FXFlow, Grok — to fulfill generation requests.</li>
            <li><strong>Cloud infrastructure:</strong> Google Cloud Storage for media file hosting and CDN delivery.</li>
            <li><strong>Analytics tools:</strong> Anonymized aggregate data only, for performance monitoring.</li>
            <li><strong>Legal authorities:</strong> If required by law or to protect the rights and safety of our users.</li>
          </ul>
          <p>All third-party integrations are governed by their respective privacy policies. We encourage you to review them.</p>
        </>
      ),
      vi: (
        <>
          <p>Chúng tôi có thể chia sẻ thông tin của bạn với:</p>
          <ul>
            <li><strong>Nhà cung cấp dịch vụ AI:</strong> Google (Gemini), OpenAI, RunningHub, FXFlow, Grok — để thực hiện yêu cầu tạo.</li>
            <li><strong>Cơ sở hạ tầng đám mây:</strong> Google Cloud Storage để lưu trữ tệp phương tiện và phân phối CDN.</li>
            <li><strong>Công cụ phân tích:</strong> Chỉ dữ liệu tổng hợp ẩn danh, để theo dõi hiệu suất.</li>
            <li><strong>Cơ quan pháp lý:</strong> Nếu được yêu cầu bởi pháp luật hoặc để bảo vệ quyền và sự an toàn của người dùng.</li>
          </ul>
          <p>Tất cả các tích hợp bên thứ ba đều được điều chỉnh bởi chính sách bảo mật tương ứng của họ. Chúng tôi khuyến khích bạn xem xét chúng.</p>
        </>
      ),
      ko: (
        <>
          <p>다음과 같은 경우 귀하의 정보를 공유할 수 있습니다:</p>
          <ul>
            <li><strong>AI 서비스 제공업체:</strong> Google (Gemini), OpenAI, RunningHub, FXFlow, Grok — 생성 요청 처리.</li>
            <li><strong>클라우드 인프라:</strong> 미디어 파일 호스팅 및 CDN 제공을 위한 Google Cloud Storage.</li>
            <li><strong>분석 도구:</strong> 성능 모니터링을 위한 익명화된 집계 데이터만.</li>
            <li><strong>법적 기관:</strong> 법률에 의해 요구되거나 사용자의 권리와 안전을 보호하기 위한 경우.</li>
          </ul>
          <p>모든 타사 통합은 각자의 개인정보 처리방침에 의해 규율됩니다. 이를 검토하시기 바랍니다.</p>
        </>
      ),
      ja: (
        <>
          <p>以下の場合にお客様の情報を共有することがあります:</p>
          <ul>
            <li><strong>AIサービスプロバイダー:</strong> Google (Gemini)、OpenAI、RunningHub、FXFlow、Grok — 生成リクエストの処理。</li>
            <li><strong>クラウドインフラ:</strong> メディアファイルのホスティングとCDN配信のためのGoogle Cloud Storage。</li>
            <li><strong>分析ツール:</strong> パフォーマンス監視のための匿名化された集計データのみ。</li>
            <li><strong>法的機関:</strong> 法律で義務付けられている場合、またはユーザーの権利と安全を保護するため。</li>
          </ul>
          <p>すべてのサードパーティ統合は、それぞれのプライバシーポリシーに準じます。ご確認いただくことをお勧めします。</p>
        </>
      ),
    },
  },
  {
    id: 'data-security',
    icon: <Lock size={18} />,
    title: {
      en: 'Data Security',
      vi: 'Bảo mật Dữ liệu',
      ko: '데이터 보안',
      ja: 'データセキュリティ',
    },
    body: {
      en: (
        <>
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul>
            <li>All data is transmitted over <strong>HTTPS / TLS 1.3</strong> encrypted connections</li>
            <li>Passwords are hashed using <strong>scrypt</strong> — never stored in plain text</li>
            <li>Authentication tokens (JWT) expire after <strong>7 days</strong> and are signed with secret keys</li>
            <li>Database access is restricted to internal network only (MongoDB Atlas VPC peering)</li>
            <li>Regular security reviews and dependency audits are performed</li>
          </ul>
          <p>While we strive to protect your data, no internet transmission is 100% secure. Please keep your account credentials safe and report any suspicious activity to our team.</p>
        </>
      ),
      vi: (
        <>
          <p>Chúng tôi triển khai các biện pháp bảo mật tiêu chuẩn ngành để bảo vệ dữ liệu của bạn:</p>
          <ul>
            <li>Tất cả dữ liệu được truyền qua kết nối mã hóa <strong>HTTPS / TLS 1.3</strong></li>
            <li>Mật khẩu được băm bằng <strong>scrypt</strong> — không bao giờ lưu trữ dưới dạng văn bản thuần</li>
            <li>Token xác thực (JWT) hết hạn sau <strong>7 ngày</strong> và được ký bằng khóa bí mật</li>
            <li>Truy cập cơ sở dữ liệu chỉ giới hạn trong mạng nội bộ (MongoDB Atlas VPC peering)</li>
            <li>Kiểm tra bảo mật và kiểm toán phụ thuộc thường xuyên được thực hiện</li>
          </ul>
          <p>Mặc dù chúng tôi cố gắng bảo vệ dữ liệu của bạn, không có truyền internet nào là 100% an toàn. Vui lòng giữ thông tin đăng nhập của bạn an toàn và báo cáo bất kỳ hoạt động đáng ngờ nào cho nhóm của chúng tôi.</p>
        </>
      ),
      ko: (
        <>
          <p>당사는 귀하의 데이터를 보호하기 위해 업계 표준 보안 조치를 구현합니다:</p>
          <ul>
            <li>모든 데이터는 <strong>HTTPS / TLS 1.3</strong> 암호화 연결로 전송됩니다</li>
            <li>비밀번호는 <strong>scrypt</strong>를 사용하여 해시 처리됩니다 — 평문으로 저장하지 않습니다</li>
            <li>인증 토큰(JWT)은 <strong>7일</strong> 후 만료되며 비밀 키로 서명됩니다</li>
            <li>데이터베이스 접근은 내부 네트워크로만 제한됩니다(MongoDB Atlas VPC 피어링)</li>
            <li>정기적인 보안 검토 및 종속성 감사가 수행됩니다</li>
          </ul>
          <p>데이터를 보호하기 위해 노력하지만, 인터넷 전송이 100% 안전하지는 않습니다. 계정 자격 증명을 안전하게 유지하고 의심스러운 활동은 팀에 신고해 주시기 바랍니다.</p>
        </>
      ),
      ja: (
        <>
          <p>当社はお客様のデータを保護するために業界標準のセキュリティ対策を実施しています:</p>
          <ul>
            <li>すべてのデータは<strong>HTTPS / TLS 1.3</strong>暗号化接続で送信されます</li>
            <li>パスワードは<strong>scrypt</strong>を使用してハッシュ化され、平文では保存されません</li>
            <li>認証トークン(JWT)は<strong>7日</strong>後に失効し、秘密鍵で署名されます</li>
            <li>データベースアクセスは内部ネットワークのみに制限されています(MongoDB Atlas VPCピアリング)</li>
            <li>定期的なセキュリティレビューと依存関係の監査が実施されます</li>
          </ul>
          <p>データ保護に努めていますが、インターネット通信は100%安全ではありません。アカウントの認証情報を安全に保ち、不審なアクティビティはチームにご報告ください。</p>
        </>
      ),
    },
  },
  {
    id: 'data-retention',
    icon: <Server size={18} />,
    title: {
      en: 'Data Retention',
      vi: 'Lưu giữ Dữ liệu',
      ko: '데이터 보관',
      ja: 'データ保持',
    },
    body: {
      en: (
        <>
          <p>We retain your data for as long as necessary to provide you with our services or as required by law:</p>
          <ul>
            <li><strong>Account data:</strong> Retained while your account is active. Deleted within 30 days of account closure upon request.</li>
            <li><strong>Generation history:</strong> Job records are retained for 12 months for debugging and quality purposes.</li>
            <li><strong>Transaction logs:</strong> Credit transactions are retained for 5 years for financial compliance.</li>
            <li><strong>Generated media:</strong> Stored on GCS for 90 days, then auto-purged unless saved to your library.</li>
            <li><strong>Log files:</strong> Server logs are retained for 30 days and automatically deleted.</li>
          </ul>
        </>
      ),
      vi: (
        <>
          <p>Chúng tôi lưu giữ dữ liệu của bạn miễn là cần thiết để cung cấp dịch vụ hoặc theo yêu cầu pháp lý:</p>
          <ul>
            <li><strong>Dữ liệu tài khoản:</strong> Lưu giữ khi tài khoản của bạn còn hoạt động. Xóa trong vòng 30 ngày kể từ khi đóng tài khoản theo yêu cầu.</li>
            <li><strong>Lịch sử tạo:</strong> Bản ghi công việc được lưu giữ trong 12 tháng cho mục đích gỡ lỗi và chất lượng.</li>
            <li><strong>Nhật ký giao dịch:</strong> Giao dịch credit được lưu giữ trong 5 năm để tuân thủ tài chính.</li>
            <li><strong>Media được tạo:</strong> Lưu trữ trên GCS trong 90 ngày, sau đó tự động xóa trừ khi được lưu vào thư viện của bạn.</li>
            <li><strong>Tệp nhật ký:</strong> Nhật ký máy chủ được lưu giữ trong 30 ngày và tự động xóa.</li>
          </ul>
        </>
      ),
      ko: (
        <>
          <p>당사는 서비스 제공에 필요한 기간 또는 법률에 의해 요구되는 기간 동안 귀하의 데이터를 보관합니다:</p>
          <ul>
            <li><strong>계정 데이터:</strong> 계정이 활성 상태인 동안 보관. 요청 시 계정 해지 후 30일 이내 삭제.</li>
            <li><strong>생성 기록:</strong> 디버깅 및 품질 목적으로 12개월간 작업 기록 보관.</li>
            <li><strong>거래 로그:</strong> 금융 규정 준수를 위해 크레딧 거래는 5년간 보관.</li>
            <li><strong>생성된 미디어:</strong> GCS에 90일간 저장 후 라이브러리에 저장되지 않으면 자동 삭제.</li>
            <li><strong>로그 파일:</strong> 서버 로그는 30일간 보관 후 자동 삭제.</li>
          </ul>
        </>
      ),
      ja: (
        <>
          <p>当社はサービス提供に必要な期間、または法律で要求される期間、お客様のデータを保持します:</p>
          <ul>
            <li><strong>アカウントデータ:</strong> アカウントがアクティブな間保持。リクエストに応じ、アカウント閉鎖後30日以内に削除。</li>
            <li><strong>生成履歴:</strong> デバッグと品質管理のため、ジョブレコードを12ヶ月間保持。</li>
            <li><strong>取引ログ:</strong> 財務コンプライアンスのため、クレジット取引を5年間保持。</li>
            <li><strong>生成されたメディア:</strong> GCSに90日間保存後、ライブラリに保存されていない場合は自動削除。</li>
            <li><strong>ログファイル:</strong> サーバーログは30日間保持後に自動削除。</li>
          </ul>
        </>
      ),
    },
  },
  {
    id: 'your-rights',
    icon: <Shield size={18} />,
    title: {
      en: 'Your Rights',
      vi: 'Quyền của Bạn',
      ko: '귀하의 권리',
      ja: 'お客様の権利',
    },
    body: {
      en: (
        <>
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Rectification:</strong> Correct any inaccurate or incomplete information.</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten").</li>
            <li><strong>Portability:</strong> Receive your data in a machine-readable format.</li>
            <li><strong>Objection:</strong> Object to processing of your data for certain purposes.</li>
            <li><strong>Restriction:</strong> Request that we restrict processing of your data.</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:privacy@skyverses.com" className="text-brand-blue hover:underline">privacy@skyverses.com</a>. We will respond within 30 days.</p>
        </>
      ),
      vi: (
        <>
          <p>Tùy thuộc vào vị trí của bạn, bạn có thể có các quyền sau liên quan đến dữ liệu cá nhân của mình:</p>
          <ul>
            <li><strong>Truy cập:</strong> Yêu cầu bản sao dữ liệu cá nhân chúng tôi lưu giữ về bạn.</li>
            <li><strong>Chỉnh sửa:</strong> Sửa thông tin không chính xác hoặc không đầy đủ.</li>
            <li><strong>Xóa:</strong> Yêu cầu xóa dữ liệu cá nhân của bạn ("quyền được quên").</li>
            <li><strong>Tính di động:</strong> Nhận dữ liệu của bạn ở định dạng có thể đọc được bằng máy.</li>
            <li><strong>Phản đối:</strong> Phản đối việc xử lý dữ liệu của bạn cho một số mục đích nhất định.</li>
            <li><strong>Hạn chế:</strong> Yêu cầu chúng tôi hạn chế xử lý dữ liệu của bạn.</li>
          </ul>
          <p>Để thực hiện bất kỳ quyền nào trong số này, hãy liên hệ với chúng tôi tại <a href="mailto:privacy@skyverses.com" className="text-brand-blue hover:underline">privacy@skyverses.com</a>. Chúng tôi sẽ phản hồi trong vòng 30 ngày.</p>
        </>
      ),
      ko: (
        <>
          <p>귀하의 위치에 따라 개인 데이터에 관한 다음과 같은 권리를 가질 수 있습니다:</p>
          <ul>
            <li><strong>접근:</strong> 당사가 보유한 귀하의 개인 데이터 사본 요청.</li>
            <li><strong>정정:</strong> 부정확하거나 불완전한 정보 수정.</li>
            <li><strong>삭제:</strong> 개인 데이터 삭제 요청 ("잊혀질 권리").</li>
            <li><strong>이동성:</strong> 기계 판독 가능한 형식으로 데이터 수령.</li>
            <li><strong>이의 제기:</strong> 특정 목적의 데이터 처리에 이의 제기.</li>
            <li><strong>제한:</strong> 데이터 처리 제한 요청.</li>
          </ul>
          <p>이러한 권리를 행사하려면 <a href="mailto:privacy@skyverses.com" className="text-brand-blue hover:underline">privacy@skyverses.com</a>으로 문의하세요. 30일 이내에 응답드리겠습니다.</p>
        </>
      ),
      ja: (
        <>
          <p>お客様の所在地によっては、個人データに関して以下の権利を有する場合があります:</p>
          <ul>
            <li><strong>アクセス:</strong> 当社が保有するお客様の個人データのコピーを要求。</li>
            <li><strong>訂正:</strong> 不正確または不完全な情報を修正。</li>
            <li><strong>削除:</strong> 個人データの削除を要求 ("忘れられる権利")。</li>
            <li><strong>ポータビリティ:</strong> 機械可読形式でデータを受け取る。</li>
            <li><strong>異議申し立て:</strong> 特定の目的でのデータ処理に異議を申し立て。</li>
            <li><strong>制限:</strong> データ処理の制限を要求。</li>
          </ul>
          <p>これらの権利を行使するには、<a href="mailto:privacy@skyverses.com" className="text-brand-blue hover:underline">privacy@skyverses.com</a>までお問い合わせください。30日以内に対応いたします。</p>
        </>
      ),
    },
  },
  {
    id: 'cookies',
    icon: <Bell size={18} />,
    title: {
      en: 'Cookies & Tracking',
      vi: 'Cookie & Theo dõi',
      ko: '쿠키 및 추적',
      ja: 'クッキーとトラッキング',
    },
    body: {
      en: (
        <>
          <p>We use cookies and similar technologies to enhance your experience:</p>
          <ul>
            <li><strong>Essential cookies:</strong> Required for authentication, session management, and security.</li>
            <li><strong>Preference cookies:</strong> Remember your language selection and theme preference (stored in <code>localStorage</code>).</li>
            <li><strong>Analytics cookies:</strong> Anonymized usage data to understand feature adoption.</li>
          </ul>
          <p>You may disable cookies in your browser settings, but this may affect the functionality of our platform. We do not use third-party advertising cookies or cross-site tracking.</p>
        </>
      ),
      vi: (
        <>
          <p>Chúng tôi sử dụng cookie và các công nghệ tương tự để nâng cao trải nghiệm của bạn:</p>
          <ul>
            <li><strong>Cookie thiết yếu:</strong> Cần thiết cho xác thực, quản lý phiên và bảo mật.</li>
            <li><strong>Cookie tùy chọn:</strong> Ghi nhớ lựa chọn ngôn ngữ và tùy chọn giao diện của bạn (lưu trong <code>localStorage</code>).</li>
            <li><strong>Cookie phân tích:</strong> Dữ liệu sử dụng ẩn danh để hiểu việc áp dụng tính năng.</li>
          </ul>
          <p>Bạn có thể tắt cookie trong cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng đến chức năng của nền tảng. Chúng tôi không sử dụng cookie quảng cáo của bên thứ ba hoặc theo dõi xuyên trang web.</p>
        </>
      ),
      ko: (
        <>
          <p>당사는 귀하의 경험을 향상시키기 위해 쿠키 및 유사 기술을 사용합니다:</p>
          <ul>
            <li><strong>필수 쿠키:</strong> 인증, 세션 관리 및 보안에 필요.</li>
            <li><strong>기본 설정 쿠키:</strong> 귀하의 언어 선택 및 테마 기본 설정을 기억 (<code>localStorage</code>에 저장).</li>
            <li><strong>분석 쿠키:</strong> 기능 채택을 이해하기 위한 익명화된 사용 데이터.</li>
          </ul>
          <p>브라우저 설정에서 쿠키를 비활성화할 수 있지만 플랫폼 기능에 영향을 미칠 수 있습니다. 당사는 제3자 광고 쿠키나 사이트 간 추적을 사용하지 않습니다.</p>
        </>
      ),
      ja: (
        <>
          <p>当社はお客様の体験を向上させるためにクッキーや類似技術を使用しています:</p>
          <ul>
            <li><strong>必須クッキー:</strong> 認証、セッション管理、セキュリティに必要。</li>
            <li><strong>設定クッキー:</strong> 言語選択とテーマ設定を記憶 (<code>localStorage</code>に保存)。</li>
            <li><strong>分析クッキー:</strong> 機能の採用状況を把握するための匿名化された使用データ。</li>
          </ul>
          <p>ブラウザ設定でクッキーを無効にすることができますが、プラットフォームの機能に影響する場合があります。当社はサードパーティの広告クッキーやクロスサイトトラッキングは使用していません。</p>
        </>
      ),
    },
  },
  {
    id: 'contact',
    icon: <Mail size={18} />,
    title: {
      en: 'Contact Us',
      vi: 'Liên hệ Chúng tôi',
      ko: '문의하기',
      ja: 'お問い合わせ',
    },
    body: {
      en: (
        <>
          <p>If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please reach us through:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:privacy@skyverses.com" className="text-brand-blue hover:underline">privacy@skyverses.com</a></li>
            <li><strong>Booking/Support:</strong> <a href="https://ai.skyverses.com/booking" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline inline-flex items-center gap-1">ai.skyverses.com/booking <ExternalLink size={12} /></a></li>
            <li><strong>Telegram:</strong> <a href="https://t.me/skyverses" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">t.me/skyverses</a></li>
          </ul>
          <p>We are committed to resolving any privacy concerns promptly and transparently. Changes to this policy will be announced via our blog with at least 7 days notice.</p>
        </>
      ),
      vi: (
        <>
          <p>Nếu bạn có câu hỏi, mối quan ngại hoặc yêu cầu liên quan đến Chính sách Bảo mật này hoặc dữ liệu cá nhân của bạn, vui lòng liên hệ với chúng tôi qua:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:privacy@skyverses.com" className="text-brand-blue hover:underline">privacy@skyverses.com</a></li>
            <li><strong>Đặt lịch/Hỗ trợ:</strong> <a href="https://ai.skyverses.com/booking" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline inline-flex items-center gap-1">ai.skyverses.com/booking <ExternalLink size={12} /></a></li>
            <li><strong>Telegram:</strong> <a href="https://t.me/skyverses" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">t.me/skyverses</a></li>
          </ul>
          <p>Chúng tôi cam kết giải quyết mọi mối quan ngại về quyền riêng tư một cách nhanh chóng và minh bạch. Các thay đổi đối với chính sách này sẽ được thông báo qua blog của chúng tôi với ít nhất 7 ngày trước.</p>
        </>
      ),
      ko: (
        <>
          <p>이 개인정보 처리방침 또는 귀하의 개인 데이터에 관한 질문, 우려 또는 요청이 있으시면 다음을 통해 문의하세요:</p>
          <ul>
            <li><strong>이메일:</strong> <a href="mailto:privacy@skyverses.com" className="text-brand-blue hover:underline">privacy@skyverses.com</a></li>
            <li><strong>예약/지원:</strong> <a href="https://ai.skyverses.com/booking" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline inline-flex items-center gap-1">ai.skyverses.com/booking <ExternalLink size={12} /></a></li>
            <li><strong>텔레그램:</strong> <a href="https://t.me/skyverses" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">t.me/skyverses</a></li>
          </ul>
          <p>당사는 모든 개인정보 관련 우려 사항을 신속하고 투명하게 해결하겠습니다. 이 정책의 변경 사항은 최소 7일 전에 블로그를 통해 공지됩니다.</p>
        </>
      ),
      ja: (
        <>
          <p>このプライバシーポリシーまたはお客様の個人データに関するご質問、懸念、またはリクエストがある場合は、以下からお問い合わせください:</p>
          <ul>
            <li><strong>メール:</strong> <a href="mailto:privacy@skyverses.com" className="text-brand-blue hover:underline">privacy@skyverses.com</a></li>
            <li><strong>予約/サポート:</strong> <a href="https://ai.skyverses.com/booking" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline inline-flex items-center gap-1">ai.skyverses.com/booking <ExternalLink size={12} /></a></li>
            <li><strong>Telegram:</strong> <a href="https://t.me/skyverses" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">t.me/skyverses</a></li>
          </ul>
          <p>当社はすべてのプライバシーに関する懸念を迅速かつ透明に解決することをお約束します。このポリシーの変更は、少なくとも7日前にブログでお知らせします。</p>
        </>
      ),
    },
  },
];

/* ─────────────────────── Component ─────────────────────── */

const PrivacyPage: React.FC = () => {
  const { lang } = useLanguage();
  const c = content[lang] || content['en'];
  const tocRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Show scroll-to-top button
  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* ▸ Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden bg-white dark:bg-[#080809]">
        {/* Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-blue/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[300px] h-[200px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #0090ff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        <div className="relative max-w-4xl mx-auto px-4 md:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-[11px] font-black tracking-[0.15em] uppercase mb-6">
            <Shield size={10} fill="currentColor" />
            {c.hero_badge}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-5 leading-[1.05]">
            {c.hero_title}
          </h1>

          <p className="text-[15px] md:text-[16px] text-slate-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-6">
            {c.hero_subtitle}
          </p>

          <p className="text-[12px] font-semibold text-slate-400 dark:text-gray-600">
            {c.last_updated}
          </p>
        </div>
      </section>

      {/* ▸ Main layout: TOC + Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* ── Sticky TOC (desktop) ── */}
          <aside ref={tocRef} className="hidden lg:block shrink-0 w-60 xl:w-64 self-start sticky top-24">
            <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] p-5">
              <p className="text-[10px] font-black tracking-[0.18em] text-slate-400 dark:text-gray-600 uppercase mb-4">
                {c.toc_title}
              </p>
              <nav className="space-y-1">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-left transition-all group ${
                      activeSection === s.id
                        ? 'bg-brand-blue/10 text-brand-blue'
                        : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className={`shrink-0 ${activeSection === s.id ? 'text-brand-blue' : 'text-slate-300 dark:text-gray-700 group-hover:text-slate-500 dark:group-hover:text-gray-400'}`}>
                      {s.icon}
                    </span>
                    <span className="line-clamp-2">{s.title[lang] || s.title['en']}</span>
                    {activeSection === s.id && (
                      <ChevronRight size={12} className="ml-auto shrink-0 text-brand-blue" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Back link */}
              <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 hover:text-brand-blue transition-colors"
                >
                  <span className="text-slate-300 dark:text-gray-700">←</span> {c.back_home}
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Content ── */}
          <article className="flex-1 min-w-0">
            {/* Mobile TOC notice */}
            <div className="lg:hidden mb-6 p-4 rounded-2xl bg-brand-blue/[0.06] border border-brand-blue/20 flex items-center gap-3">
              <Shield size={16} className="text-brand-blue shrink-0" />
              <p className="text-[12px] text-slate-600 dark:text-gray-400 font-medium">
                {c.hero_subtitle}
              </p>
            </div>

            {/* ── Sections ── */}
            <div className="space-y-1">
              {SECTIONS.map((section, idx) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 py-8 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0"
                >
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-brand-blue/10 border border-brand-blue/15 flex items-center justify-center text-brand-blue shrink-0">
                      {section.icon}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-black text-slate-300 dark:text-gray-700 tracking-wider">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {section.title[lang] || section.title['en']}
                      </h2>
                    </div>
                  </div>

                  {/* Section body */}
                  <div
                    className={`
                      prose dark:prose-invert max-w-none
                      prose-p:text-[14px] prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-gray-400
                      prose-li:text-[14px] prose-li:leading-relaxed prose-li:text-slate-600 dark:prose-li:text-gray-400
                      prose-strong:text-slate-800 dark:prose-strong:text-gray-200 prose-strong:font-bold
                      prose-ul:my-4 prose-li:my-1.5
                      prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
                      prose-code:text-brand-blue prose-code:bg-brand-blue/[0.07] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[12px] prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
                    `}
                  >
                    {section.body[lang] || section.body['en']}
                  </div>
                </section>
              ))}
            </div>

            {/* ── CTA bottom card ── */}
            <div className="mt-12 relative overflow-hidden rounded-3xl bg-slate-950 border border-white/[0.07] shadow-2xl p-8 md:p-10">
              {/* Glows */}
              <div className="absolute -top-20 left-1/4 w-[400px] h-[200px] bg-brand-blue/20 rounded-full blur-[100px]" />
              <div className="absolute -bottom-16 right-1/4 w-[300px] h-[180px] bg-purple-600/10 rounded-full blur-[80px]" />
              {/* Shimmer */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock size={16} className="text-brand-blue" />
                    <p className="text-[11px] font-black tracking-[0.15em] text-brand-blue uppercase">Privacy by Design</p>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2">
                    Questions about your data?
                  </h3>
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    Our team is available to answer any privacy-related questions or help you exercise your data rights.
                  </p>
                </div>
                <a
                  href="mailto:privacy@skyverses.com"
                  className="shrink-0 flex items-center gap-2 px-6 py-3 bg-brand-blue text-white text-[13px] font-black rounded-2xl hover:brightness-110 active:scale-[0.97] transition-all shadow-xl shadow-brand-blue/30"
                >
                  <Mail size={14} />
                  Contact Privacy Team
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 md:bottom-8 right-5 z-50 w-10 h-10 rounded-2xl bg-brand-blue text-white flex items-center justify-center shadow-xl shadow-brand-blue/30 hover:brightness-110 active:scale-90 transition-all"
          aria-label="Scroll to top"
        >
          <ArrowUp size={16} />
        </button>
      )}
    </>
  );
};

export default PrivacyPage;
