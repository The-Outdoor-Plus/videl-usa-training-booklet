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
      return;
    }

    const container = containerRef.current;
    const imageWrapper = imageWrapperRef.current;
    const image = imageRef.current;

    if (!container || !imageWrapper || !image) return;

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
        onComplete: () => { currentTimeline.current = null; }
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
    }, undefined, ZOOM_PAST_DURATION * 0.35);

    console.log('[handleZoomToFeature] Proceeding with animation for feature:', feature.id);
  };

  const handleZoomOut = () => {
    if (currentTimeline.current?.isActive()) return;

    const imageWrapper = imageWrapperRef.current;
    const container = containerRef.current;
    if (!imageWrapper || !container) return;

    currentTimeline.current = gsap.timeline({
        onComplete: () => {
            setActiveFeature(null); 
            setIsZoomed(false);
            gsap.set(container.querySelectorAll('.hotspot'), { opacity: 1 });
            currentTimeline.current = null;
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
    }, '>-0.4');

    currentTimeline.current.to(container.querySelectorAll('.hotspot'), { 
        opacity: 1, 
        duration: ZOOM_OUT_DURATION * 0.7,
        ease: 'power2.out'
    }, "<0.2");
  };

  useLayoutEffect(() => {
    // Force-remove any lingering GSAP inline styles before setting new defaults
    if (imageWrapperRef.current) {
        gsap.set(imageWrapperRef.current, { clearProps: "all" });
    }
    // Set initial/default visual state (important after clearProps)
    gsap.set(imageWrapperRef.current, { scale: 1, x: 0, y: 0, opacity: 1 });
    
    // Reset internal component state
    setIsZoomed(false);
    setActiveFeature(null);
    setIsDetailViewVisible(false);
    setIsImageLoaded(false); // Reset image loaded status first

    // Check if image is already loaded (e.g., from cache)
    const imageElement = imageRef.current;
    if (imageElement?.complete && imageElement.naturalWidth > 0) {
      // If complete and has dimensions, the onLoad event might not fire.
      console.log('[ProductInteractiveViewer] Image already complete, manually setting isImageLoaded = true');
      setIsImageLoaded(true);
    }
    // The onLoad prop on <img/> handles cases where it loads asynchronously.

    // Cleanup function
    return () => {
      console.log('[ProductInteractiveViewer] Cleanup effect running for:', mainImage);
      // Kill any active timeline
      currentTimeline.current?.kill();
      // Clear GSAP props again on cleanup to be thorough
      if (imageWrapperRef.current) {
          gsap.set(imageWrapperRef.current, { clearProps: "all" });
      }
    }
  }, [mainImage]); // Dependency array includes mainImage

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
          />
        ) : (
          <Hotspot
            key={feature.id}
            feature={feature}
            nonInteractive={true}
            onClick={() => {}}
            viewerContainerRef={containerRef}
          />
        ))}
      </div>

      <FeatureDetailView
        feature={activeFeature}
        isVisible={isDetailViewVisible}
        onClose={handleZoomOut}
      />
    </div>
    </div>
  );
};

export default ProductInteractiveViewer;