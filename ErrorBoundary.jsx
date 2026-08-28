import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[VANTA] Uncaught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex items-center justify-center p-8">
          <div className="glass rounded-xl2 p-8 max-w-md text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-vdanger/10 flex items-center justify-center mb-4">
              <AlertTriangle className="text-vdanger" size={22} />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Something broke</h3>
            <p className="text-sm text-vtext-muted mb-4">
              This part of VANTA hit an unexpected error. Reloading usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-vaccent hover:bg-vaccent-soft transition-colors text-sm font-medium"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
