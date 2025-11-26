import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { CalendarIcon, EyeIcon } from '@heroicons/react/24/outline';

const BlogPost = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const response = await api.get(`/content/blog/${slug}`);
      setBlog(response.data.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog post not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {blog.image && (
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          )}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
            <div className="flex items-center text-gray-600 mb-6">
              <CalendarIcon className="h-5 w-5 mr-2" />
              <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
              {blog.author && (
                <span className="ml-4">By {blog.author}</span>
              )}
              {blog.views && (
                <>
                  <EyeIcon className="h-5 w-5 ml-4 mr-2" />
                  <span>{blog.views} views</span>
                </>
              )}
            </div>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
              {blog.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;



