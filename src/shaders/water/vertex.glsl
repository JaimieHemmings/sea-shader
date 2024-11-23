uniform float uTime;
uniform float uWaveAmplitude;
uniform vec2 uWaveFrequency;
uniform float uWaveSpeed;

varying float vElevation;

void main()
{
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

// Elevation formula
  float elevation = sin(modelPosition.x * uWaveFrequency.x + uTime * uWaveSpeed) *
                    sin(modelPosition.z * uWaveFrequency.y + uTime * uWaveSpeed) *
                    uWaveAmplitude;

  modelPosition.y += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // Varying
  vElevation = elevation;
}