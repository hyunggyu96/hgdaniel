'use client';

interface ExportButtonProps {
    collectedNews: any[];
}

export default function ExportCollectionsButton({ collectedNews }: ExportButtonProps) {
    const handleExport = async () => {
        try {
            // Dynamic import to avoid SSR and module evaluation issues with xlsx
            const XLSX = await import('xlsx');

            console.log(`[Export] Starting export for ${collectedNews.length} items...`);
            if (collectedNews.length === 0) {
                alert('No collections to export');
                return;
            }

            // Prepare data for Excel
            const data = collectedNews.map(article => ({
                '제목': article.title || '',
                '링크': article.link || '',
                '발행일': article.published_at || '',
                '요약': article.brief_summary || article.description || ''
            }));

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(data);

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Collections');

            // Generate Excel file and download
            const fileName = `collections_${new Date().toISOString().split('T')[0]}.xlsx`;
            console.log(`[Export] Writing file: ${fileName}`);
            XLSX.writeFile(workbook, fileName);
            console.log('[Export] Success');
        } catch (error) {
            console.error('[Export] Failed:', error);
            alert('Export failed. Please check console for details.');
        }
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#3182f6] hover:bg-[#2563eb] text-white rounded-xl transition-all font-bold text-sm"
        >
            다운로드
        </button>
    );
}

