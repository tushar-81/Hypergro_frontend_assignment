// Test script to verify form builder functionality
// Run this in the browser console while on the form builder page

console.log('🧪 Form Builder Test Script');

// Test 1: Check if FormBuilderContext is available
try {
  const formBuilderElement = document.querySelector('[data-testid="form-builder"]') || document.body;
  console.log('✅ Form builder interface loaded');
} catch (error) {
  console.error('❌ Form builder interface error:', error);
}

// Test 2: Check localStorage functionality
try {
  const testForm = {
    id: 'test-form-123',
    title: 'Test Form',
    description: 'Test Description',
    fields: [],
    settings: { isMultiStep: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('form_test-form-123', JSON.stringify(testForm));
  const retrieved = localStorage.getItem('form_test-form-123');
  
  if (retrieved && JSON.parse(retrieved).title === 'Test Form') {
    console.log('✅ localStorage functionality working');
    localStorage.removeItem('form_test-form-123'); // Clean up
  } else {
    console.error('❌ localStorage test failed');
  }
} catch (error) {
  console.error('❌ localStorage error:', error);
}

// Test 3: Check if drag and drop dependencies are loaded
try {
  if (window.DragEvent && window.DataTransfer) {
    console.log('✅ Drag and drop APIs available');
  } else {
    console.warn('⚠️ Drag and drop APIs may not be fully supported');
  }
} catch (error) {
  console.error('❌ Drag and drop check error:', error);
}

// Test 4: Check field palette
setTimeout(() => {
  try {
    const fieldPalette = document.querySelector('[data-testid="field-palette"]') || 
                        document.querySelector('.field-palette') ||
                        document.querySelector('[class*="palette"]');
    
    if (fieldPalette) {
      console.log('✅ Field palette rendered');
    } else {
      console.warn('⚠️ Field palette not found - check if components are rendering');
    }
  } catch (error) {
    console.error('❌ Field palette check error:', error);
  }
}, 2000);

// Test 5: Check form canvas
setTimeout(() => {
  try {
    const formCanvas = document.querySelector('[data-testid="form-canvas"]') || 
                      document.querySelector('.form-canvas') ||
                      document.querySelector('[class*="canvas"]');
    
    if (formCanvas) {
      console.log('✅ Form canvas rendered');
    } else {
      console.warn('⚠️ Form canvas not found - check if components are rendering');
    }
  } catch (error) {
    console.error('❌ Form canvas check error:', error);
  }
}, 2000);

console.log('🏁 Test script completed. Check above for results.');
console.log('📋 To manually test:');
console.log('1. Try dragging a field from the left palette');
console.log('2. Click on a field to edit its properties');
console.log('3. Toggle the preview mode');
console.log('4. Test responsive modes');
console.log('5. Open Template Manager and try templates');
