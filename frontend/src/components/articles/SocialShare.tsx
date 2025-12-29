'use client';

import { Facebook, Twitter, Linkedin, Link2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showSuccessToast } from '@/lib/toast-utils';

interface SocialShareProps {
  article: {
    _id: string;
    title: string;
    excerpt?: string;
  };
  url?: string;
}

export function SocialShare({ article, url }: SocialShareProps) {
  const shareUrl = url || `${window.location.origin}/articles/${article._id}`;
  const shareTitle = article.title;
  const shareDescription = article.excerpt || article.title;

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out: ${shareTitle}`);
    const body = encodeURIComponent(`I thought you might be interested in this article:\n\n${shareTitle}\n\n${shareDescription}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showSuccessToast('Link copied!', 'Article link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 mr-2">Share:</span>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleFacebookShare}
        className="hover:bg-blue-50 hover:text-blue-600"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleTwitterShare}
        className="hover:bg-sky-50 hover:text-sky-600"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLinkedInShare}
        className="hover:bg-blue-50 hover:text-blue-700"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleEmailShare}
        className="hover:bg-gray-50 hover:text-gray-700"
        title="Share via Email"
      >
        <Mail className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyLink}
        className="hover:bg-gray-50 hover:text-gray-700"
        title="Copy link"
      >
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
