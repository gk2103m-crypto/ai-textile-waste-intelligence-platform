import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center bg-slate-900 rounded-2xl text-white">
                    <AlertTriangle className="w-12 h-12 text-amber-400 mb-4 animate-bounce" />
                    <h2 className="text-xl font-bold mb-2">Something went wrong rendering this view</h2>
                    <p className="text-sm text-slate-400 max-w-md mb-6">
                        The page encountered an unexpected state error. Click below to reset the application view.
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false });
                            window.location.reload();
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all"
                    >
                        <RefreshCw className="w-4 h-4" /> Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}