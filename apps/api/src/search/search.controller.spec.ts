import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchFiltersDto } from './dto/search-filters.dto';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: SearchService;

  const mockSearchService = {
    search: jest.fn(),
    getSuggestions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    searchService = module.get<SearchService>(SearchService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should call searchService.search with the provided filters', async () => {
      const filters: SearchFiltersDto = {
        q: 'test',
        brandId: 'brand-1',
        limit: 20,
      };

      const expectedResult = { items: [], total: 0 };
      mockSearchService.search.mockResolvedValue(expectedResult);

      const result = await controller.search(filters);

      expect(searchService.search).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });

    it('should call searchService.search with empty filters if none provided', async () => {
      const filters = {} as SearchFiltersDto;
      const expectedResult = { items: [], total: 0 };
      mockSearchService.search.mockResolvedValue(expectedResult);

      const result = await controller.search(filters);

      expect(searchService.search).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getSuggestions', () => {
    it('should call searchService.getSuggestions with the provided query', async () => {
      const q = 'auto';
      const expectedResult = ['automovel', 'automático'];
      mockSearchService.getSuggestions.mockResolvedValue(expectedResult);

      const result = await controller.getSuggestions(q);

      expect(searchService.getSuggestions).toHaveBeenCalledWith(q);
      expect(result).toEqual(expectedResult);
    });

    it('should call searchService.getSuggestions with an empty string when q is undefined', async () => {
      const expectedResult: string[] = [];
      mockSearchService.getSuggestions.mockResolvedValue(expectedResult);

      const result = await controller.getSuggestions(undefined);

      expect(searchService.getSuggestions).toHaveBeenCalledWith('');
      expect(result).toEqual(expectedResult);
    });
  });
});
