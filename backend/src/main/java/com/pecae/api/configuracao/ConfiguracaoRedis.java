package com.pecae.api.configuracao;

import com.pecae.api.chat.services.impl.ListenerMensagemChatRedis;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Configuração de cache Redis com TTLs diferenciados por nome de cache.
 * Catálogo (dados estáticos) recebe TTL longo; buscas e sessões recebem TTL curto.
 */
@Configuration
@EnableCaching
public class ConfiguracaoRedis {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        var defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        // TTLs específicos por nome de cache
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        cacheConfigs.put("catalog-brands", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigs.put("catalog-models", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigs.put("catalog-versions", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigs.put("catalog-years", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigs.put("catalog-parts", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigs.put("catalog-categories-root", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigs.put("catalog-categories-sub", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigs.put("search-results", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigs.put("seller-stats", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigs.put("ad-config", defaultConfig.entryTtl(Duration.ofHours(6)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .transactionAware()
                .build();
    }

    @Bean
    public RedisMessageListenerContainer containerListenerRedis(
            RedisConnectionFactory connectionFactory,
            ListenerMensagemChatRedis listenerMensagemChatRedis
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(listenerMensagemChatRedis, new PatternTopic("chat:room:*"));
        return container;
    }
}
