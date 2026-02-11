import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">문제가 발생했습니다</h1>
          <p className="text-gray-600 mb-6">
            예상치 못한 오류가 발생했습니다. 페이지를 새로고침해주세요.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()}>새로고침</Button>
            <Button variant="outline" onClick={this.handleReset}>다시 시도</Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
