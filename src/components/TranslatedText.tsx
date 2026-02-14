import { useAutoTranslate } from '../contexts/TranslationContext';

interface TranslatedTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
}

export default function TranslatedText({ text, as: Component = 'span', className = '' }: TranslatedTextProps) {
  const { translatedText, isLoading } = useAutoTranslate(text);
  
  return (
    <Component className={className}>
      {isLoading ? text : translatedText}
    </Component>
  );
}
