import React from 'react';
import { Link } from 'react-router-dom';

const tools = [
    { name: 'Merge PDF', path: '/merge', description: 'Combine multiple PDFs into one single document.', icon: 'M', color: 'bg-blue-500' },
    { name: 'Split PDF', path: '/split', description: 'Extract one or more pages from a PDF file.', icon: 'S', color: 'bg-green-500' },
    { name: 'Compress PDF', path: '/compress', description: 'Reduce the file size of your PDF document.', icon: 'C', color: 'bg-yellow-500' },
    { name: 'Word to PDF', path: '/word-to-pdf', description: 'Convert Microsoft Word files to PDF.', icon: 'W', color: 'bg-sky-500' },
    { name: 'PDF to Word', path: '/pdf-to-word', description: 'Convert PDF files to editable Word documents.', icon: 'P', color: 'bg-sky-600' },
    { name: 'Excel to PDF', path: '/excel-to-pdf', description: 'Convert Microsoft Excel files to PDF.', icon: 'E', color: 'bg-emerald-500' },
    { name: 'PDF to Excel', path: '/pdf-to-excel', description: 'Convert PDF files to editable Excel spreadsheets.', icon: 'P', color: 'bg-emerald-600' },
    { name: 'PPT to PDF', path: '/ppt-to-pdf', description: 'Convert Microsoft PowerPoint files to PDF.', icon: 'P', color: 'bg-red-500' },
    { name: 'PDF to PPT', path: '/pdf-to-ppt', description: 'Convert PDF files to editable PowerPoint presentations.', icon: 'P', color: 'bg-red-600' },
    { name: 'Rotate PDF', path: '/rotate', description: 'Rotate all or specific pages in your PDF.', icon: 'R', color: 'bg-indigo-500' },
    { name: 'Unlock PDF', path: '/unlock', description: 'Remove password protection from a PDF file.', icon: 'U', color: 'bg-purple-500' },
    { name: 'Protect PDF', path: '/protect', description: 'Add a password and protect your PDF file.', icon: 'P', color: 'bg-pink-500' },
    { name: 'Add Watermark', path: '/watermark', description: 'Add a text or image watermark to your PDF.', icon: 'W', color: 'bg-teal-500' },
];

function HomePage() {
    return (
        <main className="flex-grow container mx-auto px-6 py-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">All your PDF needs in one place</h2>
            <p className="text-center text-gray-600 mb-10">A free, ad-supported platform to manage your PDF files.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {tools.map(tool => (
                    <Link to={tool.path} key={tool.name} className="block transform hover:-translate-y-1 transition-transform">
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                            <div className={`${tool.color} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                                <span className="text-3xl font-bold">{tool.icon}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">{tool.name}</h3>
                            <p className="text-gray-600 text-center text-sm flex-grow">{tool.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}

export default HomePage;
