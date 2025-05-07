import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import Hotspot from './Hotspot';
import FeatureDetailView from './FeatureDetailView';
import { Feature } from '../data/features';
import { products } from '../data/products';
import './ProductInteractiveViewer.css';

const ZOOM_PAST_SCALE = 7;
const ZOOM_PAST_DURATION = 0.6;
const ZOOM_OUT_DURATION = 0.7;

const ProductInteractiveViewer: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const currentProduct = useMemo(() => {
    return products.find(p => p.id === productId);
  }, [productId]);

  const features = currentProduct?.features || [];
  const mainImage = currentProduct?.mainImage || '/placeholder-main.png';

  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const [isDetailViewVisible, setIsDetailViewVisible] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const currentTimeline = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    setIsImageLoaded(false);
  }, [mainImage])

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleZoomToFeature = (feature: Feature) => {
    if (currentTimeline.current?.isActive() || isAnimating) return;
    setIsAnimating(true);

    console.log('[handleZoomToFeature] Clicked. Checking conditions:', {
        isImageLoaded,
        hasImageRef: !!imageRef.current,
        isTimelineActive: currentTimeline.current?.isActive(),
        isActiveFeatureSame: activeFeature?.id === feature.id,
        activeFeatureId: activeFeature?.id,
        clickedFeatureId: feature.id
    });

    if (!isImageLoaded || !imageRef.current || activeFeature?.id === feature.id || currentTimeline.current?.isActive()) {
      console.warn('[handleZoomToFeature] Exiting early. Conditions:', {
        isImageLoaded,
        hasImageRef: !!imageRef.current,
        isTimelineActive: currentTimeline.current?.isActive(),
        isActiveFeatureSame: activeFeature?.id === feature.id
      });
      setIsAnimating(false);
      return;
    }

    const container = containerRef.current;
    const imageWrapper = imageWrapperRef.current;
    const image = imageRef.current;

    if (!container || !imageWrapper || !image) {
        setIsAnimating(false);
        return;
    }

    setActiveFeature(feature);
    setIsZoomed(true);

    const containerRect = container.getBoundingClientRect();
    const wrapperRect = imageWrapper.getBoundingClientRect();
    const imageNaturalWidth = image.naturalWidth;
    const imageNaturalHeight = image.naturalHeight;

    if (imageNaturalWidth === 0 || imageNaturalHeight === 0) return;

    const wrapperAR = wrapperRect.width / wrapperRect.height;
    const imageAR = imageNaturalWidth / imageNaturalHeight;

    let renderedImageWidth = 0;
    let renderedImageHeight = 0;
    let offsetX = 0;
    let offsetY = 0;

    if (imageAR > wrapperAR) {
        renderedImageWidth = wrapperRect.width;
        renderedImageHeight = renderedImageWidth / imageAR;
        offsetY = (wrapperRect.height - renderedImageHeight) / 2;
        offsetX = 0;
    } else {
        renderedImageHeight = wrapperRect.height;
        renderedImageWidth = renderedImageHeight * imageAR;
        offsetX = (wrapperRect.width - renderedImageWidth) / 2;
        offsetY = 0;
    }

    const featurePixelX_onImage = (feature.x / 100) * renderedImageWidth;
    const featurePixelY_onImage = (feature.y / 100) * renderedImageHeight;

    const targetPixelX_wrapper = featurePixelX_onImage + offsetX;
    const targetPixelY_wrapper = featurePixelY_onImage + offsetY;
    
    const targetX = -(containerRect.width / 2) - (targetPixelX_wrapper * ZOOM_PAST_SCALE);
    const targetY = -(containerRect.height / 2) - (targetPixelY_wrapper * ZOOM_PAST_SCALE);

    currentTimeline.current = gsap.timeline({
        onComplete: () => { 
            currentTimeline.current = null;
            setIsAnimating(false);
        }
    });

    currentTimeline.current.to(imageWrapper, {
        scale: ZOOM_PAST_SCALE,
        x: targetX,
        y: targetY,
        opacity: 0,
        duration: ZOOM_PAST_DURATION,
        ease: 'power1.in',
    });

    currentTimeline.current.call(() => {
        setIsDetailViewVisible(true);
    }, undefined, ZOOM_PAST_DURATION * 0.6);

    console.log('[handleZoomToFeature] Proceeding with animation for feature:', feature.id);
  };

  const handleZoomOut = () => {
    if (currentTimeline.current?.isActive() || isAnimating) return;
    setIsAnimating(true);

    const imageWrapper = imageWrapperRef.current;
    const container = containerRef.current;
    if (!imageWrapper || !container) {
        setIsAnimating(false);
        return;
    }

    currentTimeline.current = gsap.timeline({
        onComplete: () => {
            requestAnimationFrame(() => {
                setIsAnimating(false);
                setActiveFeature(null); 
                setIsZoomed(false);
                if (container) { 
                    gsap.set(container.querySelectorAll('.hotspot'), { opacity: 1 });
                }
                currentTimeline.current = null; 
            });
        }
    });

    currentTimeline.current.call(() => {
        setIsDetailViewVisible(false);
    });

    currentTimeline.current.to(imageWrapper, {
        scale: 1,
        x: 0,
        y: 0,
        opacity: 1,
        duration: ZOOM_OUT_DURATION,
        ease: 'power3.out',
    }, '>0.05');

    currentTimeline.current.to(container.querySelectorAll('.hotspot'), { 
        opacity: 1, 
        duration: ZOOM_OUT_DURATION * 0.7,
        ease: 'power2.out'
    }, `<${ZOOM_OUT_DURATION * 0.4}`);
  };

  useLayoutEffect(() => {
    if (imageWrapperRef.current) {
        gsap.set(imageWrapperRef.current, { clearProps: "all" });
    }
    gsap.set(imageWrapperRef.current, { scale: 1, x: 0, y: 0, opacity: 1 });
    
    setIsZoomed(false);
    setActiveFeature(null);
    setIsDetailViewVisible(false);
    setIsImageLoaded(false);

    const imageElement = imageRef.current;
    if (imageElement?.complete && imageElement.naturalWidth > 0) {
      console.log('[ProductInteractiveViewer] Image already complete, manually setting isImageLoaded = true');
      setIsImageLoaded(true);
    }

    setIsAnimating(false);

    return () => {
      console.log('[ProductInteractiveViewer] Cleanup effect running for:', mainImage);
      currentTimeline.current?.kill();
      if (imageWrapperRef.current) {
          gsap.set(imageWrapperRef.current, { clearProps: "all" });
      }
      setIsAnimating(false);
    }
  }, [mainImage]);

  if (!currentProduct) {
      return <div style={{ padding: '40px', textAlign: 'center' }}><h2>Product not found!</h2></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '20px', marginLeft: '20px' }}><button style={{ backgroundColor: 'transparent', color: '#942424', border: '1px solid #942424', fontSize: '16px', cursor: 'pointer' }} onClick={() => navigate('/products')}>Go Back</button></div>
    <div className={`product-interactive-viewer ${isZoomed ? 'zoomed-in' : ''}`} ref={containerRef}>
      <div className="image-wrapper" ref={imageWrapperRef}>
        <img
          key={mainImage}
          src={mainImage}
          alt={`${currentProduct.name} Overview`}
          ref={imageRef}
          onLoad={handleImageLoad}
        />
        {features.map((feature) => feature.description ? (
          <Hotspot
            key={feature.id}
            feature={feature}
            onClick={handleZoomToFeature}
            className={`hotspot ${activeFeature?.id === feature.id ? 'active' : ''}`}
            viewerContainerRef={containerRef}
            isAnimating={isAnimating}
          />
        ) : (
          <Hotspot
            key={feature.id}
            feature={feature}
            nonInteractive={true}
            onClick={() => {}}
            viewerContainerRef={containerRef}
            isAnimating={isAnimating}
          />
        ))}
      </div>

      <FeatureDetailView
        feature={activeFeature}
        isVisible={isDetailViewVisible}
        onClose={handleZoomOut}
        isAnimating={isAnimating}
      />
    </div>
    </div>
  );
};

export default ProductInteractiveViewer;