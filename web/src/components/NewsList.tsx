import React from 'react';
import { getNews } from '@/lib/api';
import { groupNewsByCategory, CATEGORIES_CONFIG } from '@/lib/constants';
import NewsListContainer from './NewsListContainer';

interface NewsListProps {
    selectedCategory?: string | null;
    currentPage?: number;
    searchQuery?: string;
    showCollections?: boolean;
}

export default async function NewsList({ selectedCategory, currentPage = 1, searchQuery, showCollections }: NewsListProps) {
    const allNews = await getNews();
    const newsByCategory = groupNewsByCategory(allNews);
    const itemsPerPage = 20;

    let filteredNews: any[] = [];
    if (selectedCategory) {
        filteredNews = newsByCategory[selectedCategory] || [];
    } else {
        filteredNews = allNews;
    }

    if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredNews = filteredNews.filter(article =>
            article.title?.toLowerCase().includes(query) ||
            article.description?.toLowerCase().includes(query) ||
            article.main_keywords?.some((kw: string) => kw.toLowerCase().includes(query))
        );
    }

    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const isLandingPage = !selectedCategory && !searchQuery && !showCollections;

    return (
        <NewsListContainer
            allNews={allNews}
            newsByCategory={newsByCategory}
            paginatedNews={paginatedNews}
            currentPage={currentPage}
            totalPages={totalPages}
            selectedCategory={selectedCategory || null}
            searchQuery={searchQuery || null}
            showCollections={showCollections || false}
            today={today}
            isLandingPage={isLandingPage}
            CATEGORIES_CONFIG={CATEGORIES_CONFIG}
        />
    );
}
