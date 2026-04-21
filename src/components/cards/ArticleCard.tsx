import Link from 'next/link'
import type { Article } from '@/lib/api'

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`}
      className="block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all group">
      {article.featured_image && (
        <img src={article.featured_image} alt={article.title}
          className="w-full h-36 object-cover" />
      )}
      <div className="p-4">
        <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">
          {article.category?.replace(/_/g, ' ')}
        </span>
        <h3 className="font-semibold text-slate-800 text-sm mt-1 line-clamp-2 group-hover:text-brand-600">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="text-xs text-slate-400 mt-2">
          {article.reading_time} min read
          {article.published_at && ` · ${new Date(article.published_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}`}
        </div>
      </div>
    </Link>
  )
}
