import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-cyan-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">プライバシーポリシー</h1>
          </div>

          <p className="text-sm text-gray-500 mb-8">最終更新日: 2025年11月8日</p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 収集する個人情報及び利用目的</h2>
              <p className="text-gray-700 mb-4">
              当社（以下「当社」または「本サービス」）は、自社ウェブサービスにおける利用者の個人情報の取扱いに関し、
              EU一般データ保護規則（GDPR）やEUデジタルサービス法（DSA）、日本の個人情報保護法など、適用される各国・地域の法令を遵守し、
              利用者のプライバシー保護に努めます。本ポリシーでは当社が収集する個人情報の種類と利用目的、利用者の権利、Cookie等の利用、
              第三者提供およびデータ移転対策、保存期間・安全管理措置、各法域の通知・同意手続などについて明確に説明します。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>収集項目：</strong>当社は、本サービスの提供・運営のために必要な範囲で利用者の個人情報を収集します。
                具体例として、会員登録時には氏名、メールアドレス、電話番号、住所などの連絡先情報を、決済処理ではクレジットカード情報（当社では直接保持せず決済代行業者に提供）を、
                お問い合わせ時にはメールアドレスや問い合わせ内容に含まれる情報を収集します。
                また、サービス利用状況の分析にはIPアドレス、アクセス日時、閲覧履歴などのログ情報やCookie（閲覧履歴等）を利用します。</li>
                <li><strong>利用目的：</strong>収集した情報は、主に以下の目的で利用します。
                例として、登録情報は本人確認およびアカウント管理、メールアドレスはお知らせ送信・問い合わせ対応、決済情報は契約履行（支払処理）、
                ログ情報やCookieはサービス改善・不正防止・マーケティング分析のために利用します。
                これらの利用は、利用者へのサービス提供および運営の円滑化、法令遵守（税務・会計処理等）、ユーザー体験向上を目的としています（<a href="https://gdpr.eu/privacy-notice/#:~:text=,determine%20the%20retention%20period%20of" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。</li>
                <li><strong>法的根拠：</strong>EUではGDPRに基づき個人データの処理には明確な法的根拠（利用者の同意、契約履行、法令遵守、正当な利益の追求など）が必要です。
                例えばマーケティングメール配信には事前に同意を取得し、ユーザーはいつでも同意を撤回できます。日本の個人情報保護法（APPI）では、利用目的を本人に通知・公表し、目的外利用を禁止しています。
                いずれの場合も、目的外利用は行わず、同意取得済の利用目的の範囲内でのみ処理します。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 利用者の権利</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>EU/GDPR・日本法に基づく権利：</strong>利用者は自身の個人情報に対し、開示（アクセス）を求める権利、内容が不正確な場合に訂正または更新を求める権利、
                利用停止や消去（削除）を求める権利などを有します（<a href="https://gdpr.eu/privacy-notice/#:~:text=,determine%20the%20retention%20period%20of" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。
                さらに、処理制限の請求やデータポータビリティ権、処理への異議申立権などの権利も認められており、当社はこれらの請求に速やかに対応します。
                APPIでは、個人情報の利用目的の通知や第三者提供に関する同意撤回（オプトアウト）請求権も定められています。利用者はこれら権利をいつでも行使でき、当社窓口（下記）へご連絡いただければ適切に対応します。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. クッキーおよびトラッキング技術の利用</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>当社は本サービスの利便性向上、サイト解析、広告配信のためCookieやウェブビーコン、フラッシュクッキー等のトラッキング技術を使用します。
                  これら技術によりIPアドレス、ブラウザ・端末情報、閲覧ページ、クリック履歴などを収集する場合があります。
                  Cookieにはセッション維持のための必須Cookieと、分析・広告等のための任意Cookieがあります。CookieはIPアドレス等の情報を蓄積し、場合によって個人を識別することができるため、
                  個人データとして扱われることがあります（<a href="https://gdpr.eu/cookies/#:~:text=However%2C%20cookies%20can%20store%20a,therefore%2C%20subject%20to%20the%20GDPR" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。
                  利用者はブラウザ設定でCookieを拒否・削除できますが、その場合一部機能が利用できなくなることがあります。</li>
                <li>EU域内では、GDPRとePrivacy指令により、必要不可欠でないCookieの利用には事前の利用者同意が必要です（<a href="https://gdpr.eu/cookies/#:~:text=To%20comply%20with%20the%20regulations,the%20ePrivacy%20Directive%20you%20must" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。
                  当社もこれに従い、EU域内の利用者に対してはCookie同意バナーなどを通じて同意を取得します。同意なしにサービスの利用が制限されないよう設計し、
                  同意の撤回も簡単に行える仕組みを提供します（<a href="https://gdpr.eu/cookies/#:~:text=To%20comply%20with%20the%20regulations,the%20ePrivacy%20Directive%20you%20must" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。</li>
                <li>Google Analyticsによるアクセス解析を導入しており、Googleは当社の指示に基づきデータ処理を行うデータ処理者です（<a href="https://support.google.com/analytics/answer/6004245?hl=en#zippy=%2Cgoogle-analytics-under-the-general-data-protection-regulation-gdpr%2Cgoogle-analytics-under-the-lei-geral-de-prote%C3%A7%C3%A3o-de-dados-lgpd" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。
                  Google Analyticsは主にファーストパーティCookieを用いて利用状況を測定し、利用者はGoogleの提供するアナリティクスオプトアウトアドオンや広告設定で測定を無効化できます。
                  また当社では、オプトアウト方法を利用者向けに案内しています。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 第三者への提供</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>提供先：</strong>当社は、サービス提供・運営のために必要な範囲で業務委託先や提携先、広告ネットワーク、決済代行会社などの第三者に個人情報を提供する場合があります。
                提供先には個別に契約（秘密保持契約・データ処理契約）を結び、個人情報の適切な管理を義務付けます。
                例えばGoogle Analyticsでは、Googleが当社の指示に従い利用者データを処理するデータ処理者として取り扱います（<a href="https://support.google.com/analytics/answer/6004245?hl=en#zippy=%2Cgoogle-analytics-under-the-general-data-protection-regulation-gdpr%2Cgoogle-analytics-under-the-lei-geral-de-prote%C3%A7%C3%A3o-de-dados-lgpd" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。</li>
                <li><strong>EU域外への移転：</strong>EU域内に所在する利用者の個人データを第三国に転送する場合、GDPRで定められた欧州委員会採択の標準契約条項（SCC）等、
                適切な保護措置を講じます（<a href="https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en#:~:text=According%20to%20the%20General%20Data,approved%E2%80%9D%20by%20the%20European%20Commission" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。
                十分性認定を受けた国（例：EU、英国、日本など）への転送については、認定に従った移転方法を採用します。</li>
                <li><strong>日本からの提供：</strong>日本の個人情報保護法（APPI）では、第三者提供について原則として本人の同意が必要です。
                第三者提供の際は、提供先の事業者による保護措置を確認し、必要に応じて本人への通知・同意取得を行います（<a href="https://iapp.org/news/a/practical-notes-for-the-amended-appi-how-to-amend-privacy-notices" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。
                また、オプトアウト方式（本人が拒否を表明しない限り提供可能とする方法）を利用する場合は、利用者が拒否できる手続き方法を事前に公表します（<a href="https://www.dlapiperdataprotection.com/?t=transfer&c=JP#:~:text=,request%20to%20the%20business%20operator" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 個人情報の保管期間および安全管理措置</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>当社は個人情報を利用目的に必要な期間に限り保管し、利用目的達成後は速やかに消去または匿名加工します。
                  GDPRにおいても「必要な期間を超えない限り保管する」ことが求められており、その旨を通知しています（<a href="https://gdpr.eu/privacy-notice/#:~:text=,determine%20the%20retention%20period%20of" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。
                  保管期間の決定は、利用目的や法令で定められた保存期間を勘案して定めます。</li>
                <li>個人情報の漏えい・滅失・棄損を防止するため、組織的・人的・物理的・技術的安全管理措置を実施しています。
                  具体的には、データベースへのアクセス制限、SSL/TLSによる通信暗号化、ファイアウォールやウイルス対策、ログ監視、社員教育などを行います。
                  外部サービス利用時も暗号化通信を義務付けるなど、情報保護に努めています。万が一、個人情報の漏えい等の事故が発生した場合には、被害拡大防止策を講じるとともに、速やかに監督官庁および影響を受ける利用者への通知を行います。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. 各法域別の通知義務および同意手続</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>EU（GDPR・DSA）：</strong>GDPR下では、当社はプライバシーポリシーを利用者がアクセスしやすい形式で提示し、処理の目的や法的根拠、権利行使方法を明示します（<a href="https://gdpr.eu/privacy-notice/#:~:text=,country%20and%20the%20safeguards%20taken" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。
                DSAではオンライン広告やレコメンドの透明性が規定されており、当社も広告コンテンツを明示し、未成年者のデータを用いたターゲティング広告を行いません（<a href="https://www.lw.com/admin/upload/SiteAttachments/Digital-Services-Act-Practical-Implications-for-Online-Services-and-Platforms.pdf#:~:text=has%20already%20been%20made%3B%20and,privacy%2C%20and%20safety%20of%20minors" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。</li>
                <li><strong>日本（APPI）：</strong>日本では個人情報取得時に利用目的を本人に通知または公表する義務があります（<a href="https://www.japaneselawtranslation.go.jp/en/laws/view/4241/en#:~:text=match%20at%20L1212%20Article%2021,it%20has%20acquired%20personal%20information" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。
                また、一定以上の規模の事業者は個人情報取扱規程を作成・公開し、個人データの管理方法を明示する必要があります。利用者には当社所定の窓口で個人情報の開示、訂正、利用停止・消去等を請求できる旨を通知します。
                さらに、第三者提供や海外転送の際には必要に応じて本人同意を取得し、個人情報保護委員会が定めるガイドラインに従った対応を行います。</li>
                <li><strong>その他：</strong>各法域で認められる例外（法令上の義務、刑事捜査への協力、司法判断への対応等）を除き、利用者の同意なく個人情報を目的外利用・提供することはありません。
                また、プライバシーポリシーの内容は予告なく変更する場合があります。改訂があった場合は本ページにてお知らせします。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. サードパーティサービスとの関係およびデータ移転リスクへの対応</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Google Analytics：</strong>当社はアクセス解析にGoogle Analyticsを利用しており、GoogleはGDPR下のデータ処理者として当社の指示に従い情報を処理します（<a href="https://support.google.com/analytics/answer/6004245?hl=en#zippy=%2Cgoogle-analytics-under-the-general-data-protection-regulation-gdpr%2Cgoogle-analytics-under-the-lei-geral-de-prote%C3%A7%C3%A3o-de-dados-lgpd" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。
                IPアドレスの匿名化オプションを有効化し、利用者はGoogle提供のオプトアウトツールで追跡を無効化できます。</li>
                <li><strong>決済代行サービス：</strong>Stripe、PayPalなどの決済事業者を利用しています。カード情報などの機密データは当社サーバーを経由せず、決済代行事業者の安全な環境で処理されます。
                当社はPCI DSS等の認定を受けたサービスを採用し、責任をもって業務委託しています。</li>
                <li><strong>その他外部サービス：</strong>メール配信システム、広告配信ネットワーク、クラウドサービス等と連携しています。
                これら各社は独自のプライバシーポリシーを持ち、必要に応じて当社とデータ処理契約を締結しています。利用者は各サービスのオプトアウト方法（メール購読停止、広告設定など）を選択できます。</li>
                <li><strong>データ移転対策：</strong>サービス提供には海外事業者も含まれるため、データの国際移転に伴うリスクを管理します。
                EU圏からの移転にはEU標準契約条項を締結し（<a href="https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en#:~:text=According%20to%20the%20General%20Data,approved%E2%80%9D%20by%20the%20European%20Commission" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）、
                日本のAPPIに基づいて提供先の保護措置を確認しています（<a href="https://iapp.org/news/a/practical-notes-for-the-amended-appi-how-to-amend-privacy-notices" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 underline inline-flex items-center gap-1">参照<ExternalLink className="h-3 w-3" /></a>）。
                日本から第三国へ移転する場合も、移転先の法制度・安全管理状況を評価し、必要に応じて本人同意や適切な契約条項を用いて保護します。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. お問い合わせ窓口および本ポリシーの変更</h2>
              <p className="text-gray-700 mb-4">
                本ポリシーに関するご質問や個人情報の開示・訂正・削除請求等は、下記の当社窓口までお問い合わせください。
                確認の上、所定の手続きに従って速やかに対応いたします。なお、本ポリシーは必要に応じて改定することがあります。
                最新の内容は当社ウェブサイトに掲載し、改定時には適切に告知します。
              </p>
              <strong>【お問い合わせ窓口】</strong>
              <p className="text-gray-700 mb-4">（例）Eメール:info@mangabirth.com</p>
              <p className="text-gray-700 mb-4">
                （例）本プライバシーポリシーに関するお問い合わせは、
                <Link to="/contact" className="text-cyan-600 hover:underline">お問い合わせフォーム</Link>よりご連絡ください。
              </p>
            </section>

          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              to="/"
              className="text-cyan-600 hover:text-cyan-700 font-medium"
            >
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
