package com.antonio.bodydashboard.config;

import java.net.URI;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

import jakarta.annotation.PostConstruct;

@ConfigurationProperties(prefix = "body-dashboard.ai.interpretation")
public class AiInterpretationProperties {

    private Provider provider = Provider.NONE;
    private String model = "";
    private URI baseUrl = URI.create("https://api.openai.com/v1");
    private String apiKey = "";
    private Duration timeout = Duration.ofSeconds(30);

    @PostConstruct
    void validateOnStartup() {
        validate();
    }

    public void validate() {
        if (provider == null) {
            throw new IllegalStateException("AI interpretation provider must be configured");
        }

        if (timeout == null || timeout.isZero() || timeout.isNegative()) {
            throw new IllegalStateException("AI interpretation timeout must be greater than zero");
        }

        if (provider == Provider.OPENAI_COMPATIBLE) {
            validateOpenAiCompatibleConfiguration();
        }
    }

    private void validateOpenAiCompatibleConfiguration() {
        if (isBlank(apiKey)) {
            throw new IllegalStateException("AI interpretation API key is required when provider is openai-compatible");
        }

        if (isBlank(model)) {
            throw new IllegalStateException("AI interpretation model is required when provider is openai-compatible");
        }

        if (baseUrl == null || isBlank(baseUrl.getScheme()) || isBlank(baseUrl.getHost())) {
            throw new IllegalStateException("AI interpretation base URL must be an absolute URL");
        }

        if (!"https".equalsIgnoreCase(baseUrl.getScheme())) {
            throw new IllegalStateException("AI interpretation base URL must use HTTPS");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public Provider getProvider() {
        return provider;
    }

    public void setProvider(Provider provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public URI getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(URI baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public Duration getTimeout() {
        return timeout;
    }

    public void setTimeout(Duration timeout) {
        this.timeout = timeout;
    }

    public enum Provider {
        NONE,
        OPENAI_COMPATIBLE
    }
}
