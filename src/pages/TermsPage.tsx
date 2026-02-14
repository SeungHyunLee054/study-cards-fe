import { AppHeader } from '@/components/AppHeader'
import { AppFooter } from '@/components/AppFooter'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader variant="brand-back" backTo="/signup" backLabel="돌아가기" />

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <p className="text-gray-600">
            시행일: 2025년 1월 1일
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제1조 (목적)</h2>
            <p className="text-gray-700 leading-relaxed">
              이 약관은 Study Cards(이하 "서비스")가 제공하는 학습 카드 서비스의 이용과 관련하여
              서비스와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제2조 (정의)</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>"서비스"란 Study Cards가 제공하는 학습 카드 기반의 학습 서비스를 말합니다.</li>
              <li>"이용자"란 본 약관에 따라 서비스를 이용하는 회원을 말합니다.</li>
              <li>"회원"이란 서비스에 가입하여 아이디를 부여받은 자를 말합니다.</li>
              <li>"학습 카드"란 서비스에서 제공하는 질문과 답변 형식의 학습 콘텐츠를 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
              <li>서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
              <li>약관이 변경되는 경우 서비스는 변경 사항을 시행일자 7일 전부터 공지합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제4조 (회원가입)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>이용자는 서비스가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
              <li>서비스는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>타인의 정보를 도용한 경우</li>
                  <li>허위의 정보를 기재한 경우</li>
                  <li>기타 서비스가 정한 이용신청 요건이 충족되지 않은 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제5조 (서비스의 제공)</h2>
            <p className="text-gray-700 leading-relaxed">서비스는 다음과 같은 서비스를 제공합니다.</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>학습 카드 생성 및 관리</li>
              <li>간격 반복 학습 시스템</li>
              <li>학습 진도 및 통계 제공</li>
              <li>기타 서비스가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제6조 (이용자의 의무)</h2>
            <p className="text-gray-700 leading-relaxed">이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>신청 또는 변경 시 허위 내용의 등록</li>
              <li>타인의 정보 도용</li>
              <li>서비스에 게시된 정보의 무단 변경</li>
              <li>서비스가 금지한 정보의 게시 또는 전송</li>
              <li>서비스의 운영을 방해하는 행위</li>
              <li>타인의 명예를 훼손하거나 불이익을 주는 행위</li>
              <li>기타 관계 법령에 위배되는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제7조 (서비스의 중단)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>서비스는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
              <li>서비스는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자가 입은 손해에 대하여 배상하지 않습니다. 단, 서비스에 고의 또는 중과실이 있는 경우에는 그러하지 아니합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제8조 (회원 탈퇴 및 자격 상실)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>회원은 서비스에 언제든지 탈퇴를 요청할 수 있으며, 서비스는 즉시 회원 탈퇴를 처리합니다.</li>
              <li>회원이 다음 각 호의 사유에 해당하는 경우, 서비스는 회원 자격을 제한 및 정지시킬 수 있습니다.
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                  <li>다른 이용자의 서비스 이용을 방해하는 경우</li>
                  <li>법령 또는 본 약관이 금지하는 행위를 한 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제9조 (면책조항)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
              <li>서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
              <li>서비스는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제10조 (분쟁해결)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>서비스와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법을 적용합니다.</li>
              <li>서비스와 이용자 간에 발생한 분쟁에 관한 소송의 관할법원은 민사소송법상의 관할법원으로 합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제11조 (유료 서비스 및 환불 정책)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>서비스는 월간 정기결제 및 연간 선결제 형태의 유료 구독 서비스를 제공할 수 있습니다.</li>
              <li>월간 정기결제는 자동결제 해제 시 다음 결제일부터 추가 청구가 중단되며, 이미 결제된 이용 기간 동안은 서비스를 계속 이용할 수 있습니다.</li>
              <li>연간 선결제 상품은 결제 완료 시점에 1년 이용권이 부여되며, 결제 후 환불은 제공되지 않습니다.</li>
              <li>유료 서비스의 운영 정책은 관련 법령을 준수하는 범위에서 변경될 수 있으며, 변경 시 사전 고지합니다.</li>
            </ol>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">부칙</h2>
            <p className="text-gray-700">본 약관은 2025년 1월 1일부터 시행합니다.</p>
          </section>
        </div>
      </main>

      <AppFooter container="max-w-6xl" />
    </div>
  )
}
