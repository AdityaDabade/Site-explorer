import { useState } from 'react';
import PropTypes from 'prop-types';
import Loader from '../common/Loader';

/**
 * File upload surface for travel photo and video stories.
 */
export default function TravelStories({ loading, onUpload }) {
  const [files, setFiles] = useState([]);

  const handleChange = (event) => {
    setFiles(Array.from(event.target.files || []));
  };

  return (
    <section className="panel p-5">
      <div className="mb-5">
        <h2 className="font-heading text-2xl text-white">Travel Stories</h2>
        <p className="mt-2 text-sm text-slate-400">Upload photos and videos to attach moments to your itinerary.</p>
      </div>

      <input className="field" multiple type="file" accept="image/*,video/*" onChange={handleChange} />

      <div className="mt-4 space-y-3">
        {files.length ? (
          files.map((file) => (
            <div key={`${file.name}-${file.size}`} className="rounded-[12px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">{file.name}</p>
              <p className="mt-1 text-slate-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Unknown type'}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-[12px] border border-dashed border-white/15 bg-slate-900/60 p-4 text-sm text-slate-400">
            Choose one or more images or videos to create a shared travel story.
          </div>
        )}
      </div>

      <button type="button" className="btn-primary mt-5 w-full" disabled={loading} onClick={() => onUpload(files)}>
        {loading ? <Loader label="Uploading..." size="sm" /> : 'Upload Stories'}
      </button>
    </section>
  );
}

TravelStories.propTypes = {
  loading: PropTypes.bool,
  onUpload: PropTypes.func.isRequired
};

TravelStories.defaultProps = {
  loading: false
};
