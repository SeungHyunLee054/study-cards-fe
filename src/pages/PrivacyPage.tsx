import { AppHeader } from '@/components/AppHeader'
import { AppFooter } from '@/components/AppFooter'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader variant="brand-back" backTo="/signup" backLabel="돌아가기" />

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보 처리방침</h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <p className="text-gray-600">
            시행일: 2025년 1월 1일
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="text-gray-700 leading-relaxed">
              Study Cards(이하 "서비스")는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인 식별, 회원자격 유지 및 관리</li>
              <li>서비스 제공: 학습 카드 서비스 제공, 학습 진도 관리, 맞춤형 학습 콘텐츠 제공</li>
              <li>서비스 개선: 서비스 이용 통계 분석, 서비스 개선을 위한 연구</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 수집하는 개인정보 항목</h2>
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-900">구분</th>
                    <th className="text-left py-2 font-medium text-gray-900">수집 항목</th>
                    <th className="text-left py-2 font-medium text-gray-900">수집 목적</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100">
                    <td className="py-3">필수</td>
                    <td className="py-3">이메일, 비밀번호, 닉네임</td>
                    <td className="py-3">회원 식별 및 서비스 제공</td>
                  </tr>
                  <tr>
                    <td className="py-3">자동 수집</td>
                    <td className="py-3">학습 기록, 접속 로그, IP 주소</td>
                    <td className="py-3">서비스 제공 및 개선</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-gray-700 leading-relaxed">
              회원의 개인정보는 회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다.
              단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
              <li>접속에 관한 기록: 3개월 (통신비밀보호법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 개인정보의 제3자 제공</h2>
            <p className="text-gray-700 leading-relaxed">
              서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 개인정보의 파기 절차 및 방법</h2>
            <p className="text-gray-700 leading-relaxed">
              개인정보는 수집 및 이용 목적이 달성된 후에는 지체 없이 파기합니다.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>전자적 파일 형태: 복구 불가능한 방법으로 영구 삭제</li>
              <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. 정보주체의 권리와 행사 방법</h2>
            <p className="text-gray-700 leading-relaxed">
              이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              위 권리 행사는 서비스 내 설정 또는 개인정보 보호책임자에게 이메일로 연락하여 하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. 개인정보 보호책임자</h2>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
              <p>성명: 홍길동</p>
              <p>직책: 개인정보 보호책임자</p>
              <p>이메일: privacy@studycards.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. 개인정보 처리방침 변경</h2>
            <p className="text-gray-700 leading-relaxed">
              이 개인정보 처리방침은 2025년 1월 1일부터 적용되며,
              법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는
              변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>
        </div>
      </main>

      <AppFooter container="max-w-6xl" />
    </div>
  )
}
