"use client";

import useNews from "@/services/useNews";
import { useEffect, useState } from "react";
import { Loader2, ChevronRight, Clock } from "lucide-react";

interface NewsItem {
  id: number;
  headline: string;
  shorterHeadline: string;
  dateLastPublished: string;
  dateFirstPublished: string;
  description: string;
  url: string;
  authorFormatted: string;
  sectionHierarchyFormatted: string;
  relatedTagsFilteredFormatted: string;
  type: string;
  promoImage?: {
    url: string;
  };
  section?: {
    tagName: string;
    url: string;
  };
}

interface NewsSection {
  id: number;
  name: string;
  headline: string;
  shortestHeadline: string;
  description: string;
  url: string;
  assets: NewsItem[];
}

export default function NewsPage() {
  const [newsSections, setNewsSections] = useState<NewsSection[]>([]);
  const [popularNews, setPopularNews] = useState<NewsItem[]>([]);
  const [reportsNews, setReportsNews] = useState<NewsItem[]>([]);

  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingSections, setLoadingSections] = useState(true);

  const [activeSection, setActiveSection] = useState<number>(0);
  const { getNews, getReportNews, getTrendingNews } = useNews();

  useEffect(() => {
    const fetchTrendingNews = async () => {
      try {
        setLoadingTrending(true);
        const popularData = await getTrendingNews();
        const popular = popularData?.data?.data?.mostPopularEntries?.assets || [];
        setPopularNews(popular);
      } catch (error) {
        console.error("Error fetching trending news:", error);
      } finally {
        setLoadingTrending(false);
      }
    };

    const fetchReportNews = async () => {
      try {
        setLoadingReports(true);
        const reportsData = await getReportNews();
        const reports = reportsData?.data?.data?.specialReportsEntries?.results || [];
        setReportsNews(reports);
      } catch (error) {
        console.error("Error fetching report news:", error);
      } finally {
        setLoadingReports(false);
      }
    };

    const fetchSectionsNews = async () => {
      try {
        setLoadingSections(true);
        const listData = await getNews();
        const sections = listData?.data?.data?.sectionsEntries || [];
        setNewsSections(sections);
      } catch (error) {
        console.error("Error fetching sections news:", error);
      } finally {
        setLoadingSections(false);
      }
    };

    Promise.all([
      fetchTrendingNews(),
      fetchReportNews(),
      fetchSectionsNews()
    ]);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return formatDate(dateString);
    }
  };

  const getTags = (tagsString: string) => {
    if (!tagsString) return [];
    return tagsString.split('|').slice(0, 3);
  };

  const getAuthors = (authorsString: string) => {
    if (!authorsString || authorsString === 'NA') return null;
    const authors = authorsString.split('|');
    if (authors.length > 2) {
      return `${authors[0]} và ${authors.length - 1} người khác`;
    }
    return authors.join(', ');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cnbcvideo':
        return (
          <div className="absolute top-3 right-3 bg-red-500 rounded-full p-2">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const currentSection = newsSections[activeSection];

  // Skeleton for Trending News
  const TrendingSkeleton = () => (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gray-800 rounded-xl animate-pulse" />
        <div>
          <div className="h-7 w-32 bg-gray-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="lg:row-span-2 rounded-2xl overflow-hidden border border-gray-800 bg-[#111318]">
          <div className="h-80 w-full bg-gray-800 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
            <div className="h-7 w-full bg-gray-800 rounded animate-pulse" />
            <div className="h-7 w-3/4 bg-gray-800 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-800 bg-[#111318] flex h-32">
              <div className="w-32 h-32 bg-gray-800 animate-pulse shrink-0" />
              <div className="p-4 flex-1 space-y-2">
                <div className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Skeleton for Reports
  const ReportsSkeleton = () => (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gray-800 rounded-xl animate-pulse" />
        <div>
          <div className="h-7 w-40 bg-gray-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-56 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-gray-800 bg-[#111318]">
            <div className="h-40 w-full bg-gray-800 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-800 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Skeleton for Section Articles
  const SectionSkeleton = () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-gray-800 bg-[#111318]">
          <div className="h-48 w-full bg-gray-800 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-32 bg-gray-800 rounded animate-pulse" />
            <div className="h-5 w-full bg-gray-800 rounded animate-pulse" />
            <div className="h-5 w-4/5 bg-gray-800 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-800 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-gray-800 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 pl-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400 mb-2">
            Tin tức thị trường
          </h1>
          <p className="text-gray-400 text-sm">Cập nhật tin tức mới nhất từ CNBC</p>
        </div>

        {/* Trending News Section */}
        {loadingTrending ? (
          <TrendingSkeleton />
        ) : popularNews.length > 0 ? (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-6 bg-red-500 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                  Tin nổi bật
                </h2>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Featured Article (First Item - Larger) */}
              {popularNews[0] && (
                <article
                  onClick={() => window.open(popularNews[0].url, '_blank')}
                  className="lg:row-span-2 group cursor-pointer rounded-2xl overflow-hidden shadow-lg border border-gray-800 bg-[#111318]"
                >
                  {popularNews[0].promoImage && (
                    <div className="relative h-80 w-full overflow-hidden bg-gray-800">
                      <img
                        src={popularNews[0].promoImage.url}
                        alt={popularNews[0].headline}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {getTypeIcon(popularNews[0].type)}
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-2 rounded-full text-xs font-bold bg-linear-to-r from-red-600 to-orange-600 text-white shadow-lg">
                          🔥 HOT NHẤT
                        </span>
                      </div>
                      {popularNews[0].section && (
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-sm text-white border border-white/10">
                            {popularNews[0].section.tagName}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatRelativeTime(popularNews[0].dateLastPublished)}</span>
                      {getAuthors(popularNews[0].authorFormatted) && (
                        <>
                          <span>•</span>
                          <span className="capitalize text-gray-300">{getAuthors(popularNews[0].authorFormatted)}</span>
                        </>
                      )}
                    </div>
                    <h2 className="font-bold text-2xl mb-4 text-white group-hover:text-primary transition-colors">
                      {popularNews[0].shorterHeadline || popularNews[0].headline}
                    </h2>
                    <p className="text-base text-gray-400 mb-4 line-clamp-4">
                      {popularNews[0].description}
                    </p>
                    {popularNews[0].relatedTagsFilteredFormatted && getTags(popularNews[0].relatedTagsFilteredFormatted).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {getTags(popularNews[0].relatedTagsFilteredFormatted).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-3 py-1.5 rounded-full font-medium bg-orange-500/20 text-orange-600"
                          >
                            {tag.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              )}

              {/* Other Popular Articles */}
              <div className="space-y-4">
                {popularNews.slice(1, 4).map((news, index) => (
                  <article
                    key={news.id}
                    onClick={() => window.open(news.url, '_blank')}
                    className="group cursor-pointer rounded-xl overflow-hidden shadow-md border border-gray-800 bg-[#111318] hover:border-gray-600 transition-all duration-300 flex"
                  >
                    {news.promoImage && (
                      <div className="relative w-32 h-32 shrink-0 overflow-hidden bg-gray-800">
                        <img
                          src={news.promoImage.url}
                          alt={news.headline}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {getTypeIcon(news.type)}
                      </div>
                    )}
                    <div className="p-4 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white">
                          #{index + 2}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(news.dateLastPublished)}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm mb-2 text-white group-hover:text-primary transition-colors line-clamp-2">
                        {news.shorterHeadline || news.headline}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {news.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Special Reports Section */}
        {loadingReports ? (
          <ReportsSkeleton />
        ) : reportsNews.length > 0 ? (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-6 bg-primary rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                  Báo cáo đặc biệt
                </h2>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {reportsNews.slice(0, 4).map((report) => (
                <article
                  key={report.id}
                  onClick={() => window.open(report.url, '_blank')}
                  className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg border border-gray-800 bg-[#111318] hover:border-gray-600 transition-all duration-300"
                >
                  {report.promoImage && (
                    <div className="relative h-40 w-full overflow-hidden bg-gray-800">
                      <img
                        src={report.promoImage.url}
                        alt={report.headline}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {getTypeIcon(report.type)}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-md">
                          📊 REPORT
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-xs text-text/60">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatRelativeTime(report.dateLastPublished)}</span>
                    </div>
                    <h3 className="font-bold text-base mb-2 text-white group-hover:text-primary transition-colors line-clamp-3">
                      {report.shorterHeadline || report.headline}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                      {report.description}
                    </p>
                    {report.section && (
                      <span className="inline-block text-[10px] px-2 py-1 rounded-full font-medium bg-white/5 text-gray-300 border border-gray-700">
                        {report.section.tagName}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {/* Divider */}
        {((!loadingTrending && popularNews.length > 0) || (!loadingReports && reportsNews.length > 0)) && (!loadingSections && newsSections.length > 0) && (
          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-text/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-background text-sm font-semibold text-text/60">
                Tin tức theo chủ đề
              </span>
            </div>
          </div>
        )}

        {/* Sections Tabs */}
        {loadingSections ? (
          <div className="mb-8">
            <div className="flex gap-3 pb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-32 bg-text/10 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : newsSections.length > 0 && (
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-3 pb-2">
              {newsSections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(index)}
                  className={`px-6 cursor-pointer py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all border ${
                    activeSection === index
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                      : "bg-[#111318] border-gray-800 text-gray-400 hover:bg-gray-800 hover:border-gray-600"
                  }`}
                >
                  {section.shortestHeadline || section.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section Info */}
        {loadingSections ? (
          <div className="mb-6 p-6 rounded-2xl border border-gray-800 bg-[#111318]">
            <div className="h-7 w-2/3 bg-gray-800 rounded animate-pulse mb-3" />
            <div className="h-4 w-full bg-gray-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-4/5 bg-gray-800 rounded animate-pulse mb-3" />
            <div className="h-5 w-32 bg-gray-800 rounded animate-pulse" />
          </div>
        ) : currentSection && (
          <div className="mb-6 p-6 rounded-2xl bg-[#111318] border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-2">{currentSection.headline}</h2>
            <p className="text-gray-400 mb-3">{currentSection.description}</p>
            <a
              href={currentSection.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium"
            >
              Xem tất cả bài viết
              <ChevronRight size={16} />
            </a>
          </div>
        )}

        {/* Grid layout */}
        {loadingSections ? (
          <SectionSkeleton />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentSection?.assets.map((news) => (
            <article
              key={news.id}
              onClick={() => window.open(news.url, '_blank')}
              className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg border border-gray-800 bg-[#111318] hover:border-gray-600 transition-all duration-300"
            >
              {/* Image */}
              {news.promoImage && (
                <div className="relative h-48 w-full overflow-hidden bg-gray-800">
                  <img
                    src={news.promoImage.url}
                    alt={news.headline}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Type Icon */}
                  {getTypeIcon(news.type)}
                  {/* Category Badge */}
                  {news.section && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-md">
                        {news.section.tagName}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-5">
                {/* Meta info */}
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                  <Clock size={14} />
                  <span>{formatRelativeTime(news.dateLastPublished)}</span>
                  {getAuthors(news.authorFormatted) && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{getAuthors(news.authorFormatted)}</span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h2 className="font-bold text-lg mb-3 text-white group-hover:text-primary transition-colors line-clamp-2">
                  {news.shorterHeadline || news.headline}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                  {news.description}
                </p>

                {/* Tags */}
                {news.relatedTagsFilteredFormatted && getTags(news.relatedTagsFilteredFormatted).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {getTags(news.relatedTagsFilteredFormatted).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-800 text-gray-400 border border-gray-700 group-hover:bg-gray-700 transition-colors"
                      >
                        {tag.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
          </div>
        )}

        {/* Empty State - only show if sections are loaded and empty */}
        {!loadingSections && newsSections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="w-24 h-24 text-gray-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-500 text-center text-lg">
              Không có tin tức nào
            </p>
          </div>
        )}

        {!loadingSections && currentSection && currentSection.assets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="w-24 h-24 text-gray-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-center text-lg">
              Mục này chưa có bài viết
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
