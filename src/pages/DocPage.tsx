import { useParams, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { DOCS } from '../docs';
import { CodeBlock } from '../components/CodeBlock';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DocPage() {
  const { docId = 'introduction' } = useParams();
  const doc = DOCS.find((d) => d.id === docId);

  if (!doc) {
    return <Navigate to="/" replace />;
  }

  const currentIndex = DOCS.findIndex((d) => d.id === docId);
  const prevDoc = DOCS[currentIndex - 1];
  const nextDoc = DOCS[currentIndex + 1];

  return (
    <motion.div
      key={doc.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-3xl"
    >
     
      {/* Content */}
      <div className="markdown-body prose prose-zinc max-w-none">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <CodeBlock
                  language={match[1]}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {doc.content}
        </ReactMarkdown>
      </div>

      {/* Navigation */}
      <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {prevDoc ? (
          <Link
            to={prevDoc.id === 'introduction' ? '/' : `/${prevDoc.id}`}
            className="group flex flex-col items-start gap-2 p-6 rounded-2xl border border-zinc-200 hover:border-zinc-900 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50"
          >
            <span className="flex items-center gap-1 text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">
              <ChevronLeft className="w-3 h-3" /> Previous
            </span>
            <span className="font-bold text-lg text-zinc-900 tracking-tight">{prevDoc.title}</span>
          </Link>
        ) : <div />}

        {nextDoc ? (
          <Link
            to={`/${nextDoc.id}`}
            className="group flex flex-col items-end gap-2 p-6 rounded-2xl border border-zinc-200 hover:border-zinc-900 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 text-right"
          >
            <span className="flex items-center gap-1 text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">
              Next <ChevronRight className="w-3 h-3" />
            </span>
            <span className="font-bold text-lg text-zinc-900 tracking-tight">{nextDoc.title}</span>
          </Link>
        ) : <div />}
      </div>
    </motion.div>
  );
}