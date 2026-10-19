import { DatasetProvider } from '../components/dataset/DatasetProvider';
import { UploadInput } from '../components/dataset/UploadInput';
import { StatusMessages } from '../components/dataset/StatusMessage';
import { SavedList } from '../components/dataset/SavedList';
import { DatasetGrid } from '../components/dataset/DatasetGrid';
import { SaveButton } from '../components/dataset/SaveButton';

export default function UploadPage() {
  return (
    <DatasetProvider>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Upload & Map Spreadsheet</h1>
        <UploadInput />
        <StatusMessages />
        <SavedList />
        <SaveButton />
        <DatasetGrid />
      </div>
    </DatasetProvider>
  );
}