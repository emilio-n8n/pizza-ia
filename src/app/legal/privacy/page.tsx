import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';

// Cette page est rendue côté serveur pour pouvoir lire les fichiers locaux.
export default function PrivacyPolicyPage() {
  // Chemin vers le fichier Markdown
  const filePath = path.join(process.cwd(), 'PRIVACY.md');
  const markdown = fs.readFileSync(filePath, 'utf-8');

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose prose-lg mx-auto">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
