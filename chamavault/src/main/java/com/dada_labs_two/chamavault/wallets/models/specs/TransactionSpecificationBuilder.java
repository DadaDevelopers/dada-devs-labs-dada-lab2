package com.dada_labs_two.chamavault.wallets.models.specs;

import com.dada_labs_two.chamavault.wallets.models.Transaction;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.time.ZonedDateTime;
import java.util.*;

public class TransactionSpecificationBuilder {
    public static Specification<Transaction> build(Map<String, String> filters) {
        return ((root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            for (Map.Entry<String, String> entry: filters.entrySet()) {
                Filter  filter = parseFilter(entry.getKey(), entry.getValue());
                predicates.add(buildPredicate(root, criteriaBuilder, filter));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        });
    }

    private static Predicate buildPredicate(Root<Transaction> root,
                                     CriteriaBuilder cb,
                                     Filter filter) {
        Path path = resolvePath(root, filter.field());
        Class<?> type = path.getJavaType();
        Object value = convert(type, filter.value());

        return switch (filter.operator()) {
            case EQ -> cb.equal(path, value);
            case GT, GTE, LT, LTE -> compare(cb,path, (Comparable) value,filter.operator());
            case CONTAINS -> cb.like(cb.lower(path.as(String.class)), "%"+filter.value().toLowerCase()+"%");
            case STARTS_WITH -> cb.like(cb.lower(path.as(String.class)), filter.value().toLowerCase()+"%");
            case ENDS_WITH -> cb.like(cb.lower(path.as(String.class)), "%"+filter.value().toLowerCase());
            case IN -> {

                CriteriaBuilder.In<Object> in = cb.in(path);

                for (String s : filter.value().split(",")) {
                    s = s.trim();

                    if (!s.isBlank()) {
                        in.value(convert(type, s));
                    }
                }

                yield in;
            }

            case BETWEEN -> {

                String[] values = filter.value().split(",");
                if (values.length != 2) {
                    throw new IllegalArgumentException(
                            "BETWEEN expects two values.");
                }

                Comparable from =
                        (Comparable) convert(type, values[0]);

                Comparable to =
                        (Comparable) convert(type, values[1]);

                yield cb.between(path, from, to);
            }
        };
    }

    private static Path<?> resolvePath(Path<?> root, String field) {
        Path<?> path = root;

        for (String part: field.split("\\."))
            path = path.get(part);

        return path;
    }


    @SuppressWarnings({"rawtypes", "unchecked"})
    private static Predicate compare(
            CriteriaBuilder cb,
            Path path,
            Comparable value,
            FilterOperator operator) {

        return switch (operator) {
            case GT -> cb.greaterThan(path, value);
            case GTE -> cb.greaterThanOrEqualTo(path, value);
            case LT -> cb.lessThan(path, value);
            case LTE -> cb.lessThanOrEqualTo(path, value);
            default -> throw new IllegalArgumentException();
        };
    }

    private static Object convert(Class<?> type, String value) {
        if (type == Long.class)
            return Long.valueOf(value);

        if (type == UUID.class)
            return UUID.fromString(value);

        if (type.isEnum())
            return Enum.valueOf((Class<? extends Enum>) type, value);

        if (type == ZonedDateTime.class)
            return  ZonedDateTime.parse(value);

        return value;
    }

    private static Filter parseFilter(String key, String value) {
        String[] split = key.split("\\.");
        String field = key;

        FilterOperator operator = FilterOperator.EQ;

        //check wether the last part is an operator
        if (split.length > 1) {
            try {
                operator = FilterOperator.from(split[split.length - 1]);

                //join everything except the last part back into the field name
                field = String.join(".", Arrays.copyOf(split, split.length  -1));
            } catch (IllegalArgumentException ignored) {
                //the last part wasnt an operator, so the whole field is in the field
            }
        }

        return new Filter(field, operator, value);
    }

    record Filter(String field,
                  FilterOperator operator,
                  String value) {}

    enum FilterOperator{
        EQ("eq"),
        GT("gt"),
        GTE("gte"),
        LT("lt"),
        LTE("lte"),
        CONTAINS("contains"),
        STARTS_WITH("startsWith"),
        ENDS_WITH("endsWith"),
        IN("in"),
        BETWEEN("between");

        private final String keyword;

        FilterOperator(String keyword) {
            this.keyword = keyword;
        }

        public static FilterOperator from(String keyword) {
            for (FilterOperator operator : values()) {
                if (operator.keyword.equals(keyword)) {
                    return operator;
                }
            }

            throw new IllegalArgumentException("Unknown operator: " + keyword);
        }
    }
}
